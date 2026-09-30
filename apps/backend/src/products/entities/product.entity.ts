import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductStep } from './product-step.entity';
import { ProductIngredient } from './product-ingredient.entity';

@Entity('products')
@Index('idx_products_active', ['active'])
@Index('idx_products_category_id', ['category'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({ name: 'container_size', nullable: true })
  containerSize: string;

  @Column({ default: 'heladeria' })
  line: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Category, (cat) => cat.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductStep, (step) => step.product, { cascade: true, eager: true })
  steps: ProductStep[];

  @OneToMany(() => ProductIngredient, (pi) => pi.product, { cascade: true })
  productIngredients: ProductIngredient[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
