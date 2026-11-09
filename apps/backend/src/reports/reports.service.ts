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
    // Compute from-date in Guatemala timezone so month/week boundaries are correct
    const gtNow = now.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }); // YYYY-MM-DD
    const [gYear, gMonth] = gtNow.split('-').map(Number);

    let fromDate: string;
    if (period === 'day') {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      fromDate = d.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      fromDate = d.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
    } else {
      // Start of current calendar month in Guatemala timezone
      fromDate = `${gYear}-${String(gMonth).padStart(2, '0')}-01`;
    }

    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select("DATE(o.completed_at AT TIME ZONE 'America/Guatemala')", 'date')
      .addSelect('SUM(o.total)', 'revenue')
      .addSelect('COUNT(o.id)', 'orders')
      .where('o.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere("DATE(o.completed_at AT TIME ZONE 'America/Guatemala') >= :fromDate", { fromDate })
      .groupBy("DATE(o.completed_at AT TIME ZONE 'America/Guatemala')")
      .orderBy("DATE(o.completed_at AT TIME ZONE 'America/Guatemala')", 'ASC')
      .getRawMany();

    const total = result.reduce((sum, r) => sum + Number(r.revenue), 0);
    return { period, from: fromDate, to: gtNow, total, byDay: result };
  }

  async getTopProducts(limit = 10) {
    const startOfMonth = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
    const [y, m] = startOfMonth.split('-').map(Number);
    const fromDate = `${y}-${String(m).padStart(2, '0')}-01`;

    return this.itemRepo
      .createQueryBuilder('oi')
      .withDeleted()
      .leftJoin('oi.product', 'p')
      .innerJoin('oi.order', 'o')
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('SUM(oi.unit_price * oi.quantity)', 'totalRevenue')
      .where('o.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere("DATE(o.completed_at AT TIME ZONE 'America/Guatemala') >= :fromDate", { fromDate })
      .groupBy('p.id, p.name')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getIngredientConsumption(from: string, to: string) {
    return this.usedRepo
      .createQueryBuilder('u')
      .withDeleted()
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
    const todayRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .addSelect('COUNT(o.id)', 'count')
      .where('o.status = :s', { s: OrderStatus.COMPLETED })
      .andWhere("DATE(o.completed_at AT TIME ZONE 'America/Guatemala') = DATE(NOW() AT TIME ZONE 'America/Guatemala')")
      .getRawOne();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDate = weekAgo.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
    const weekRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .addSelect('COUNT(o.id)', 'count')
      .where('o.status = :s', { s: OrderStatus.COMPLETED })
      .andWhere("DATE(o.completed_at AT TIME ZONE 'America/Guatemala') >= :weekAgoDate", { weekAgoDate })
      .getRawOne();

    const lowStockCount = await this.ingredientRepo
      .createQueryBuilder('i')
      .where('i.stock_quantity <= i.min_threshold')
      .andWhere('i.active = true')
      .getCount();

    return {
      today: { revenue: Number(todayRevenue.total), orders: Number(todayRevenue.count) },
      week: { revenue: Number(weekRevenue.total), orders: Number(weekRevenue.count) },
      lowStockCount,
    };
  }
}
