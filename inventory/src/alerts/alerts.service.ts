import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateAlertDto, QueryAlertsDto, ResolveAlertDto } from './dto';
import { Alert } from '../entities/alert.entity';
import { Inventory } from '../entities/inventory.entity';
import { Product } from '../entities/product.entity';
import { AlertType, ProductStatus } from '../common/enums';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const product = await this.productRepository.findOne({
      where: { id: createAlertDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if there's already an unresolved alert of the same type for this product
    // Skip duplicate check for INVENTORY_UPDATE since each movement is a distinct alert
    if (createAlertDto.alertType !== AlertType.INVENTORY_UPDATE) {
      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: createAlertDto.productId,
          alertType: createAlertDto.alertType,
          isResolved: false,
        },
      });

      if (existingAlert) {
        throw new BadRequestException(
          'An unresolved alert of this type already exists for this product',
        );
      }
    }

    const alert = this.alertRepository.create({
      productId: createAlertDto.productId,
      alertType: createAlertDto.alertType,
      notes: createAlertDto.notes,
    });

    return await this.alertRepository.save(alert);
  }

  async createInventoryAlert(
    productId: number,
    userId: number,
    movementType: string,
    details: string,
  ): Promise<Alert> {
    const alert = this.alertRepository.create({
      productId,
      alertType: AlertType.INVENTORY_UPDATE,
      notes: details,
      createdById: userId,
    });

    return await this.alertRepository.save(alert);
  }

  async findAll(query: QueryAlertsDto) {
    const { productId, alertType, isResolved, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .leftJoinAndSelect('alert.resolvedBy', 'resolvedBy')
      .leftJoin('alert.createdBy', 'createdBy')
      .addSelect(['createdBy.id', 'createdBy.firstName', 'createdBy.lastName'])
      .orderBy('alert.createdAt', 'DESC');

    if (productId) {
      queryBuilder.andWhere('alert.productId = :productId', { productId });
    }

    if (alertType) {
      queryBuilder.andWhere('alert.alertType = :alertType', { alertType });
    }

    if (isResolved !== undefined && isResolved !== null) {
      const resolvedBool = String(isResolved) === 'true';
      queryBuilder.andWhere('alert.isResolved = :isResolved', { isResolved: resolvedBool });
    }

    const [alerts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['product', 'product.category', 'product.inventory', 'resolvedBy', 'createdBy'],
    });

    if (!alert) {
      throw new NotFoundException(`Alert #${id} not found`);
    }

    return alert;
  }

  async resolve(
    id: number,
    userId: number,
    resolveAlertDto?: ResolveAlertDto,
  ): Promise<Alert> {
    const alert = await this.findOne(id);

    if (alert.isResolved) {
      throw new BadRequestException('Alert is already resolved');
    }

    alert.isResolved = true;
    alert.resolvedById = userId;
    alert.resolvedAt = new Date();

    return await this.alertRepository.save(alert);
  }

  async remove(id: number): Promise<void> {
    const alert = await this.findOne(id);
    await this.alertRepository.remove(alert);
  }

  // ========================
  // AUTOMATIC ALERT DETECTION
  // ========================

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduledChecks(): Promise<void> {
    this.logger.log('Running scheduled alert checks...');
    await this.checkLowStock();
    await this.checkNoMovement(30);
    await this.checkNoMovement(60);
    await this.checkSlowMoving();
    this.logger.log('Scheduled alert checks completed');
  }

  async checkLowStock(): Promise<Alert[]> {
    this.logger.log('Checking for low stock products...');

    const lowStockProducts = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('inventory.currentStock <= product.reorderPoint')
      .getMany();

    const alerts: Alert[] = [];

    for (const inventory of lowStockProducts) {
      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: inventory.productId,
          alertType: AlertType.LOW_STOCK,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create({
          productId: inventory.productId,
          alertType: AlertType.LOW_STOCK,
        });
        const savedAlert = await this.alertRepository.save(alert);
        alerts.push(savedAlert);
        this.logger.log(
          `Low stock alert created for product ${inventory.product.name} (Stock: ${inventory.currentStock}, Reorder Point: ${inventory.product.reorderPoint})`,
        );
      }
    }

    return alerts;
  }

  async checkNoMovement(days: number = 30): Promise<Alert[]> {
    this.logger.log(`Checking for products with no movement in ${days} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const staleProducts = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('inventory.currentStock > 0')
      .andWhere(
        '(inventory.lastMovementAt < :cutoffDate OR inventory.lastMovementAt IS NULL)',
        { cutoffDate },
      )
      .getMany();

    const alerts: Alert[] = [];

    for (const inventory of staleProducts) {
      const alertType = days >= 60 ? AlertType.SLOW_MOVING : AlertType.NO_MOVEMENT;

      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: inventory.productId,
          alertType,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create({
          productId: inventory.productId,
          alertType,
        });
        const savedAlert = await this.alertRepository.save(alert);
        alerts.push(savedAlert);
        this.logger.log(
          `No movement alert (${days} days) created for product ${inventory.product.name}`,
        );
      }
    }

    return alerts;
  }

  async checkSlowMoving(): Promise<Alert[]> {
    return this.checkNoMovement(90);
  }

  async getAlertsSummary() {
    const totalAlerts = await this.alertRepository.count();
    const unresolvedAlerts = await this.alertRepository.count({
      where: { isResolved: false },
    });
    const resolvedAlerts = await this.alertRepository.count({
      where: { isResolved: true },
    });

    const byType = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.alertType', 'type')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN alert.isResolved = false THEN 1 ELSE 0 END)', 'unresolved')
      .groupBy('alert.alertType')
      .getRawMany();

    return {
      total: totalAlerts,
      unresolved: unresolvedAlerts,
      resolved: resolvedAlerts,
      byType,
    };
  }

  async runManualCheck(): Promise<{
    lowStock: Alert[];
    noMovement: Alert[];
    slowMoving: Alert[];
  }> {
    const lowStock = await this.checkLowStock();
    const noMovement = await this.checkNoMovement(30);
    const slowMoving = await this.checkSlowMoving();

    return { lowStock, noMovement, slowMoving };
  }
}
