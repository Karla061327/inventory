import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductStatus } from '../common/enums';
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { Inventory } from './inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { Alert } from './alert.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ name: 'reorder_point', default: 10 })
  reorderPoint: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.products)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory;

  @OneToMany(() => InventoryMovement, (movement) => movement.product)
  movements: InventoryMovement[];

  @OneToMany(() => Alert, (alert) => alert.product)
  alerts: Alert[];
}
