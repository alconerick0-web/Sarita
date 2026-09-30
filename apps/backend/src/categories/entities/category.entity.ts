import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
@Index('idx_categories_active', ['active'])
@Index('idx_categories_sort_order', ['sortOrder'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 'heladeria' })
  line: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
