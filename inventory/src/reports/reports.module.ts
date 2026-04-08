import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Supplier } from '../entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      InventoryMovement,
      Product,
      Category,
      Supplier,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
