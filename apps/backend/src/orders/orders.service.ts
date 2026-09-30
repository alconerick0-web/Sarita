import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemUsed } from './entities/order-item-used.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ProductsService } from '../products/products.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { TelegramService } from '../telegram/telegram.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderItemUsed) private readonly usedRepo: Repository<OrderItemUsed>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
    private readonly productsService: ProductsService,
    private readonly ingredientsService: IngredientsService,
    private readonly telegramService: TelegramService,
  ) {}

  async createOrder(employee: User, customerName?: string) {
    const order = this.orderRepo.create({ employee, customerName, status: OrderStatus.OPEN, total: 0 });
    return this.orderRepo.save(order);
  }

  async addItem(orderId: number, dto: { productId: number; flavorId?: number; quantity?: number; customizations?: Record<string, unknown> }) {
    const order = await this.findOne(orderId);
    if (order.status !== OrderStatus.OPEN) throw new BadRequestException('La orden ya está cerrada');

    const product = await this.productsService.findOne(dto.productId);
    const quantity = dto.quantity ?? 1;

    const item = this.itemRepo.create({
      order,
      product,
      flavor: dto.flavorId ? ({ id: dto.flavorId } as any) : null,
      quantity,
      unitPrice: product.price,
      customizations: dto.customizations,
    });
    await this.itemRepo.save(item);

    await this.recalculateTotal(orderId);
    return this.findOne(orderId);
  }

  async removeItem(orderId: number, itemId: number) {
    const order = await this.findOne(orderId);
    if (order.status !== OrderStatus.OPEN) throw new BadRequestException('La orden ya está cerrada');
    await this.itemRepo.delete({ id: itemId, order: { id: orderId } });
    await this.recalculateTotal(orderId);
    return this.findOne(orderId);
  }

  async completeOrder(orderId: number) {
    const order = await this.findOne(orderId);
    if (order.status !== OrderStatus.OPEN) throw new BadRequestException('La orden ya está cerrada');

    // Build aggregated requirements and validate stock before any deduction
    const required = new Map<number, number>();
    const piByItem: { item: OrderItem; pis: { ingredient: any; totalUsed: number }[] }[] = [];
    for (const item of order.items) {
      const productIngredients = await this.productsService.getProductIngredients(item.product.id);
      const pis = productIngredients.map((pi) => ({
        ingredient: pi.ingredient,
        totalUsed: Number(pi.quantityPerUnit) * item.quantity,
      }));
      piByItem.push({ item, pis });
      for (const { ingredient, totalUsed } of pis) {
        required.set(ingredient.id, (required.get(ingredient.id) ?? 0) + totalUsed);
      }
    }
    await this.ingredientsService.checkStock(
      Array.from(required.entries()).map(([ingredientId, needed]) => ({ ingredientId, needed })),
    );

    const reason = `Venta #${orderId}`;
    for (const { item, pis } of piByItem) {
      for (const { ingredient, totalUsed } of pis) {
        await this.ingredientsService.deductStock(ingredient.id, totalUsed, reason);
        const used = this.usedRepo.create({ orderItem: item, ingredient, quantityUsed: totalUsed });
        await this.usedRepo.save(used);
      }
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    order.status = OrderStatus.COMPLETED;
    order.completedAt = new Date();
    order.invoiceNumber = invoiceNumber;
    await this.orderRepo.save(order);

    const invoice = this.invoiceRepo.create({
      invoiceNumber,
      customerName: order.customerName,
      total: order.total,
      order,
    });
    await this.invoiceRepo.save(invoice);

    const completedOrder = await this.findOne(orderId);

    // Notificación de venta
    await this.telegramService.sendSaleNotification(completedOrder);

    // Alerta de stock bajo si aplica
    const lowStock = await this.ingredientsService.findLowStock();
    if (lowStock.length > 0) {
      await this.telegramService.sendLowStockAlert(lowStock);
    }

    return completedOrder;
  }

  async cancelOrder(orderId: number) {
    const order = await this.findOne(orderId);
    if (order.status !== OrderStatus.OPEN) throw new BadRequestException('La orden ya está cerrada');
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  findAll(employeeId?: number) {
    return this.orderRepo.find({
      where: employeeId ? { employee: { id: employeeId } } : {},
      order: { createdAt: 'DESC' },
      take: 100,
      withDeleted: true,
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { employee: true, items: { product: true, flavor: true }, invoice: true },
      withDeleted: true,
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  private async recalculateTotal(orderId: number) {
    const items = await this.itemRepo.find({ where: { order: { id: orderId } }, relations: { product: true }, withDeleted: true });
    const total = items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
    await this.orderRepo.update(orderId, { total });
  }

  private async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = await this.invoiceRepo.count();
    return `FAC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
