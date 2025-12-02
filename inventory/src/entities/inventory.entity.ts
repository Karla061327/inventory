import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', unique: true })
  productId: number;

  @Column({ name: 'current_stock', default: 0 })
  currentStock: number;

  @Column({ name: 'last_movement_at', type: 'timestamp', nullable: true })
  lastMovementAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
