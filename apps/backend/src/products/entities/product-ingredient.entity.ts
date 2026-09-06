import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('product_ingredients')
export class ProductIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (p) => p.productIngredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Ingredient, (i) => i.productIngredients, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'quantity_per_unit', type: 'decimal', precision: 10, scale: 2 })
  quantityPerUnit: number;
}
