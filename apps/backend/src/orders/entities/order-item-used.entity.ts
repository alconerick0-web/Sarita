import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('order_item_used')
export class OrderItemUsed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderItem, (item) => item.ingredientsUsed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => Ingredient, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'quantity_used', type: 'decimal', precision: 10, scale: 2 })
  quantityUsed: number;
}
