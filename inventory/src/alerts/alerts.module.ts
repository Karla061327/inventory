import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from '../entities/alert.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, Inventory, Product, InventoryMovement]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
