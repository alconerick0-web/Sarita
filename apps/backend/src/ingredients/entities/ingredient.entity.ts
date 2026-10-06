import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProductIngredient } from '../../products/entities/product-ingredient.entity';
import { InventoryMovement } from './inventory-movement.entity';

@Entity('ingredients')
@Index('idx_ingredients_active', ['active'])
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 'comestible' })
  category: string;

  @Column()
  unit: string;

  @Column({ name: 'stock_quantity', type: 'decimal', precision: 14, scale: 5, default: 0 })
  stockQuantity: number;

  @Column({ name: 'min_threshold', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minThreshold: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => ProductIngredient, (pi) => pi.ingredient)
  productIngredients: ProductIngredient[];

  @OneToMany(() => InventoryMovement, (m) => m.ingredient)
  movements: InventoryMovement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
