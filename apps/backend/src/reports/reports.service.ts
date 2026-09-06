import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderItemUsed } from '../orders/entities/order-item-used.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderItemUsed) private readonly usedRepo: Repository<OrderItemUsed>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async getRevenueSummary(period: 'day' | 'week' | 'month') {
    const now = new Date();
    const from = new Date(now);
    if (period === 'day') from.setDate(now.getDate() - 1);
    else if (period === 'week') from.setDate(now.getDate() - 7);
    else from.setMonth(now.getMonth() - 1);

    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.completed_at)', 'date')
      .addSelect('SUM(o.total)', 'revenue')
      .addSelect('COUNT(o.id)', 'orders')
      .where('o.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('o.completed_at >= :from', { from })
      .groupBy('DATE(o.completed_at)')
      .orderBy('DATE(o.completed_at)', 'ASC')
      .getRawMany();

    const total = result.reduce((sum, r) => sum + Number(r.revenue), 0);
    return { period, from, to: now, total, byDay: result };
  }

  async getTopProducts(limit = 10) {
    return this.itemRepo
      .createQueryBuilder('oi')
      .leftJoin('oi.product', 'p')
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('SUM(oi.unit_price * oi.quantity)', 'totalRevenue')
      .groupBy('p.id, p.name')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getIngredientConsumption(from: string, to: string) {
    return this.usedRepo
      .createQueryBuilder('u')
      .leftJoin('u.ingredient', 'i')
      .leftJoin('u.orderItem', 'oi')
      .leftJoin('oi.order', 'o')
      .select('i.id', 'id')
      .addSelect('i.name', 'name')
      .addSelect('i.unit', 'unit')
      .addSelect('SUM(u.quantity_used)', 'totalUsed')
      .where('o.completed_at BETWEEN :from AND :to', { from, to: to + ' 23:59:59' })
      .groupBy('i.id, i.name, i.unit')
      .orderBy('SUM(u.quantity_used)', 'DESC')
      .getRawMany();
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .addSelect('COUNT(o.id)', 'count')
      .where('o.status = :s', { s: OrderStatus.COMPLETED })
      .andWhere('o.completed_at >= :today', { today })
      .getRawOne();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.status = :s', { s: OrderStatus.COMPLETED })
      .andWhere('o.completed_at >= :weekAgo', { weekAgo })
      .getRawOne();

    const lowStockCount = await this.ingredientRepo
      .createQueryBuilder('i')
      .where('i.stock_quantity <= i.min_threshold')
      .andWhere('i.active = true')
      .getCount();

    return {
      today: { revenue: Number(todayRevenue.total), orders: Number(todayRevenue.count) },
      week: { revenue: Number(weekRevenue.total) },
      lowStockCount,
    };
  }
}
