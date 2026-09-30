import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_steps')
export class ProductStep {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (p) => p.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'step_number' })
  stepNumber: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'requires_flavor', default: false })
  requiresFlavor: boolean;

  @Column({ name: 'requires_topping', default: false })
  requiresTopping: boolean;

  @Column({ name: 'requires_soda_flavor', default: false })
  requiresSodaFlavor: boolean;

  @Column({ name: 'flavor_count', default: 1 })
  flavorCount: number;
}
