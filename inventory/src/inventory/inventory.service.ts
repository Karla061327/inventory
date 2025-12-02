import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  CreateInventoryEntryDto,
  CreateInventoryExitDto,
  CreateInventoryAdjustmentDto,
  QueryMovementsDto,
} from './dto';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';
import { MovementType } from '../common/enums';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createEntry(
    dto: CreateInventoryEntryDto,
    userId: number,
  ): Promise<InventoryMovement> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        productId: dto.productId,
        currentStock: 0,
      });
    }

    const stockBefore = inventory.currentStock;
    const stockAfter = stockBefore + dto.quantity;

    const movement = this.movementRepository.create({
      productId: dto.productId,
      movementType: MovementType.ENTRY,
      quantity: dto.quantity,
      stockBefore,
      stockAfter,
      referenceDoc: dto.referenceDoc,
      notes: dto.notes,
      createdById: userId,
    });

    inventory.currentStock = stockAfter;
    inventory.lastMovementAt = new Date();

    await this.inventoryRepository.save(inventory);
    return await this.movementRepository.save(movement);
  }

  async createExit(
    dto: CreateInventoryExitDto,
    userId: number,
  ): Promise<InventoryMovement> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId },
    });

    if (!inventory) {
      throw new BadRequestException('Product has no inventory record');
    }

    if (inventory.currentStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${inventory.currentStock}, Requested: ${dto.quantity}`,
      );
    }

    const stockBefore = inventory.currentStock;
    const stockAfter = stockBefore - dto.quantity;

    const movement = this.movementRepository.create({
      productId: dto.productId,
      movementType: dto.exitType,
      quantity: dto.quantity,
      stockBefore,
      stockAfter,
      referenceDoc: dto.referenceDoc,
      notes: dto.notes,
      createdById: userId,
    });

    inventory.currentStock = stockAfter;
    inventory.lastMovementAt = new Date();

    await this.inventoryRepository.save(inventory);
    return await this.movementRepository.save(movement);
  }

  async createAdjustment(
    dto: CreateInventoryAdjustmentDto,
    userId: number,
  ): Promise<InventoryMovement> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        productId: dto.productId,
        currentStock: 0,
      });
    }

    const stockBefore = inventory.currentStock;
    const stockAfter = dto.newQuantity;
    const difference = stockAfter - stockBefore;

    if (Math.abs(difference) > stockBefore * 0.1 && !dto.imageUrl) {
      throw new BadRequestException(
        'Adjustments greater than 10% require photographic evidence (imageUrl)',
      );
    }

    const movement = this.movementRepository.create({
      productId: dto.productId,
      movementType: MovementType.ADJUSTMENT,
      quantity: Math.abs(difference),
      stockBefore,
      stockAfter,
      notes: `${dto.reason}${dto.imageUrl ? ` - Evidence: ${dto.imageUrl}` : ''}`,
      createdById: userId,
    });

    inventory.currentStock = stockAfter;
    inventory.lastMovementAt = new Date();

    await this.inventoryRepository.save(inventory);
    return await this.movementRepository.save(movement);
  }

  async getMovements(query: QueryMovementsDto) {
    const {
      productId,
      movementType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.createdBy', 'user')
      .orderBy('movement.createdAt', 'DESC');

    if (productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId });
    }

    if (movementType) {
      queryBuilder.andWhere('movement.movementType = :movementType', {
        movementType,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('movement.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('movement.createdAt <= :endDate', { endDate });
    }

    const [movements, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCurrentStock(productId: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found for this product');
    }

    return inventory;
  }

  async getAllInventory() {
    const inventories = await this.inventoryRepository.find({
      relations: ['product', 'product.category', 'product.supplier'],
      order: { currentStock: 'ASC' },
    });

    const totalValue = inventories.reduce((sum, inv) => {
      return sum + inv.currentStock * (inv.product?.costPrice || 0);
    }, 0);

    const lowStockCount = inventories.filter(
      (inv) => inv.currentStock < (inv.product?.reorderPoint || 0),
    ).length;

    return {
      data: inventories,
      summary: {
        totalProducts: inventories.length,
        totalValue,
        lowStockCount,
      },
    };
  }
}
