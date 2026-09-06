import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { OrderItemUsed } from './order-item-used.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Flavor, { nullable: true, eager: true })
  @JoinColumn({ name: 'flavor_id' })
  flavor: Flavor;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  customizations: Record<string, unknown>;

  @OneToMany(() => OrderItemUsed, (used) => used.orderItem, { cascade: true })
  ingredientsUsed: OrderItemUsed[];
}
