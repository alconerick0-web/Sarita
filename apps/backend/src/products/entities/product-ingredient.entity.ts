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

  // En la unidad del ingrediente. Para helado (lb) se calcula de bolitas × onzas / 16
  @Column({ name: 'quantity_per_unit', type: 'decimal', precision: 14, scale: 5 })
  quantityPerUnit: number;

  // Solo helado: cómo se escribió la receta, para volver a mostrarla al editar
  @Column({ type: 'int', nullable: true })
  scoops: number | null;

  @Column({ name: 'ounces_per_scoop', type: 'decimal', precision: 6, scale: 2, nullable: true })
  ouncesPerScoop: number | null;
}
