import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

// Paleta usada dentro de la receta de otro producto (ej. una especialidad que lleva una paleta).
// Al vender el producto se descuenta del stock de la paleta, igual que al venderla sola.
@Entity('product_components')
export class ProductComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (p) => p.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'component_id' })
  component: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
