import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MovementType } from '../common/enums';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.movements)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'movement_type', type: 'enum', enum: MovementType })
  movementType: MovementType;

  @Column()
  quantity: number;

  @Column({ name: 'stock_before' })
  stockBefore: number;

  @Column({ name: 'stock_after' })
  stockAfter: number;

  @Column({ name: 'reference_doc', length: 100, nullable: true })
  referenceDoc: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.movements)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
