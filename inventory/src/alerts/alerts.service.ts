import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateAlertDto, QueryAlertsDto, ResolveAlertDto } from './dto';
import { Alert } from '../entities/alert.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';
import { AlertType, MovementType, ProductStatus } from '../common/enums';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
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
    await this.checkLowSales(30);
    await this.checkLowSales(60);
    await this.checkLowSales(90);
    await this.checkStockDiscrepancy();
    await this.checkOversellRisk();
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
          notes: `Stock actual: ${inventory.currentStock} unidades (punto de reorden: ${inventory.product.reorderPoint})`,
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
          notes: `Sin movimiento de inventario en los últimos ${days} días`,
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

  async checkLowSales(days: 30 | 60 | 90): Promise<Alert[]> {
    this.logger.log(`Checking for products with low sales in ${days} days...`);

    const alertTypeMap: Record<number, AlertType> = {
      30: AlertType.LOW_SALES_30,
      60: AlertType.LOW_SALES_60,
      90: AlertType.LOW_SALES_90,
    };
    const alertType = alertTypeMap[days];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const activeProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .getMany();

    const alerts: Alert[] = [];

    for (const product of activeProducts) {
      const recentSales = await this.movementRepository
        .createQueryBuilder('movement')
        .where('movement.productId = :productId', { productId: product.id })
        .andWhere('movement.movementType = :type', { type: MovementType.SALE })
        .andWhere('movement.createdAt >= :cutoffDate', { cutoffDate })
        .getCount();

      if (recentSales > 0) continue;

      // Only alert if the product has prior history or has been in the system long enough
      const totalSales = await this.movementRepository
        .createQueryBuilder('movement')
        .where('movement.productId = :productId', { productId: product.id })
        .andWhere('movement.movementType = :type', { type: MovementType.SALE })
        .getCount();

      const daysSinceCreated =
        (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);

      if (totalSales === 0 && daysSinceCreated < days) continue;

      const existingAlert = await this.alertRepository.findOne({
        where: { productId: product.id, alertType, isResolved: false },
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create({
          productId: product.id,
          alertType,
          notes: `Sin ventas en los últimos ${days} días (ventas históricas: ${totalSales})`,
        });
        alerts.push(await this.alertRepository.save(alert));
        this.logger.log(`Low sales alert (${days} days) created for product ${product.name}`);
      }
    }

    return alerts;
  }

  async checkStockDiscrepancy(): Promise<Alert[]> {
    this.logger.log('Checking for stock discrepancies...');

    const inventories = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .getMany();

    const alerts: Alert[] = [];

    for (const inventory of inventories) {
      const lastMovement = await this.movementRepository
        .createQueryBuilder('movement')
        .where('movement.productId = :productId', { productId: inventory.productId })
        .orderBy('movement.createdAt', 'DESC')
        .getOne();

      if (!lastMovement) continue;

      if (lastMovement.stockAfter !== inventory.currentStock) {
        const existingAlert = await this.alertRepository.findOne({
          where: {
            productId: inventory.productId,
            alertType: AlertType.DISCREPANCY,
            isResolved: false,
          },
        });

        if (!existingAlert) {
          const alert = this.alertRepository.create({
            productId: inventory.productId,
            alertType: AlertType.DISCREPANCY,
            notes: `Discrepancia detectada: sistema registra ${inventory.currentStock} unidades, último movimiento registró ${lastMovement.stockAfter} unidades`,
          });
          alerts.push(await this.alertRepository.save(alert));
          this.logger.warn(
            `Stock discrepancy for product ${inventory.product.name}: current=${inventory.currentStock}, last movement stockAfter=${lastMovement.stockAfter}`,
          );
        }
      }
    }

    return alerts;
  }

  async checkOversellRisk(): Promise<Alert[]> {
    this.logger.log('Checking for oversell risk products...');

    // Products with stock between 1 and 3 that also have had recent sales (last 7 days)
    const criticalThreshold = 3;
    const recentDays = 7;
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - recentDays);

    const criticalInventories = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('inventory.currentStock > 0')
      .andWhere('inventory.currentStock <= :threshold', { threshold: criticalThreshold })
      .getMany();

    const alerts: Alert[] = [];

    for (const inventory of criticalInventories) {
      const recentSales = await this.movementRepository
        .createQueryBuilder('movement')
        .where('movement.productId = :productId', { productId: inventory.productId })
        .andWhere('movement.movementType = :type', { type: MovementType.SALE })
        .andWhere('movement.createdAt >= :cutoffDate', { cutoffDate: recentCutoff })
        .getCount();

      if (recentSales === 0) continue;

      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: inventory.productId,
          alertType: AlertType.OVERSELL_RISK,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create({
          productId: inventory.productId,
          alertType: AlertType.OVERSELL_RISK,
          notes: `Riesgo de sobreventa: stock crítico de ${inventory.currentStock} unidades con ${recentSales} ventas en los últimos ${recentDays} días`,
        });
        alerts.push(await this.alertRepository.save(alert));
        this.logger.warn(
          `Oversell risk for product ${inventory.product.name}: stock=${inventory.currentStock}, recent sales=${recentSales}`,
        );
      }
    }

    return alerts;
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
    lowSales30: Alert[];
    lowSales60: Alert[];
    lowSales90: Alert[];
    discrepancy: Alert[];
    oversellRisk: Alert[];
  }> {
    const lowStock = await this.checkLowStock();
    const noMovement = await this.checkNoMovement(30);
    const slowMoving = await this.checkSlowMoving();
    const lowSales30 = await this.checkLowSales(30);
    const lowSales60 = await this.checkLowSales(60);
    const lowSales90 = await this.checkLowSales(90);
    const discrepancy = await this.checkStockDiscrepancy();
    const oversellRisk = await this.checkOversellRisk();

    return {
      lowStock,
      noMovement,
      slowMoving,
      lowSales30,
      lowSales60,
      lowSales90,
      discrepancy,
      oversellRisk,
    };
  }
}
