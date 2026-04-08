import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Supplier } from '../entities/supplier.entity';
import { MovementsReportDto, InventoryReportDto, DateRangeDto } from './dto';
import { MovementType, ProductStatus } from '../common/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async getInventoryReport(filters: InventoryReportDto) {
    const { categoryId, supplierId, lowStockOnly, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('product.status = :status', { status: ProductStatus.ACTIVE });

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (supplierId) {
      queryBuilder.andWhere('product.supplierId = :supplierId', { supplierId });
    }

    if (lowStockOnly) {
      queryBuilder.andWhere('inventory.currentStock <= product.reorderPoint');
    }

    const [items, total] = await queryBuilder
      .orderBy('inventory.currentStock', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Calculate totals
    const allInventory = await queryBuilder.getMany();
    const totalValue = allInventory.reduce((sum, inv) => {
      return sum + inv.currentStock * Number(inv.product?.costPrice || 0);
    }, 0);
    const totalSaleValue = allInventory.reduce((sum, inv) => {
      return sum + inv.currentStock * Number(inv.product?.salePrice || 0);
    }, 0);
    const totalUnits = allInventory.reduce((sum, inv) => sum + inv.currentStock, 0);
    const lowStockCount = allInventory.filter(
      (inv) => inv.currentStock <= (inv.product?.reorderPoint || 0),
    ).length;

    return {
      data: items.map((inv) => ({
        productId: inv.productId,
        sku: inv.product.sku,
        name: inv.product.name,
        category: inv.product.category?.name || 'Sin categoría',
        supplier: inv.product.supplier?.name || 'Sin proveedor',
        currentStock: inv.currentStock,
        reorderPoint: inv.product.reorderPoint,
        isLowStock: inv.currentStock <= inv.product.reorderPoint,
        costPrice: Number(inv.product.costPrice),
        salePrice: Number(inv.product.salePrice),
        stockValue: inv.currentStock * Number(inv.product.costPrice),
        potentialSaleValue: inv.currentStock * Number(inv.product.salePrice),
        lastMovementAt: inv.lastMovementAt,
      })),
      summary: {
        totalProducts: total,
        totalUnits,
        totalCostValue: totalValue,
        totalSaleValue,
        potentialProfit: totalSaleValue - totalValue,
        lowStockProducts: lowStockCount,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMovementsReport(filters: MovementsReportDto) {
    const {
      startDate,
      endDate,
      productId,
      categoryId,
      movementType,
      page = 1,
      limit = 50,
    } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .innerJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('movement.createdBy', 'user');

    if (startDate) {
      queryBuilder.andWhere('movement.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('movement.createdAt <= :endDate', {
        endDate: endDateTime,
      });
    }

    if (productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (movementType) {
      queryBuilder.andWhere('movement.movementType = :movementType', {
        movementType,
      });
    }

    const [movements, total] = await queryBuilder
      .orderBy('movement.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Get summary statistics
    const summaryQuery = this.movementRepository
      .createQueryBuilder('movement')
      .innerJoin('movement.product', 'product');

    if (startDate) {
      summaryQuery.andWhere('movement.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      summaryQuery.andWhere('movement.createdAt <= :endDate', {
        endDate: endDateTime,
      });
    }
    if (productId) {
      summaryQuery.andWhere('movement.productId = :productId', { productId });
    }
    if (categoryId) {
      summaryQuery.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const entrySummary = await summaryQuery
      .clone()
      .andWhere('movement.movementType = :type', { type: MovementType.ENTRY })
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(movement.quantity), 0)', 'total')
      .getRawOne();

    const exitSummary = await summaryQuery
      .clone()
      .andWhere('movement.movementType IN (:...types)', {
        types: [MovementType.SALE, MovementType.DAMAGED, MovementType.LOSS],
      })
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(movement.quantity), 0)', 'total')
      .getRawOne();

    const adjustmentSummary = await summaryQuery
      .clone()
      .andWhere('movement.movementType = :type', { type: MovementType.ADJUSTMENT })
      .select('COUNT(*)', 'count')
      .getRawOne();

    return {
      data: movements.map((m) => ({
        id: m.id,
        date: m.createdAt,
        productId: m.productId,
        sku: m.product.sku,
        productName: m.product.name,
        category: m.product.category?.name || 'Sin categoría',
        movementType: m.movementType,
        quantity: m.quantity,
        stockBefore: m.stockBefore,
        stockAfter: m.stockAfter,
        referenceDoc: m.referenceDoc,
        notes: m.notes,
        createdBy: m.createdBy
          ? `${m.createdBy.firstName} ${m.createdBy.lastName}`
          : 'Sistema',
      })),
      summary: {
        totalMovements: total,
        entries: {
          count: parseInt(entrySummary.count) || 0,
          totalUnits: parseInt(entrySummary.total) || 0,
        },
        exits: {
          count: parseInt(exitSummary.count) || 0,
          totalUnits: parseInt(exitSummary.total) || 0,
        },
        adjustments: {
          count: parseInt(adjustmentSummary.count) || 0,
        },
        netChange:
          (parseInt(entrySummary.total) || 0) -
          (parseInt(exitSummary.total) || 0),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getValueReport(filters: InventoryReportDto) {
    const { categoryId, supplierId } = filters;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('inventory.currentStock > 0');

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (supplierId) {
      queryBuilder.andWhere('product.supplierId = :supplierId', { supplierId });
    }

    const inventories = await queryBuilder.getMany();

    // Group by category
    const byCategory = new Map<string, { units: number; costValue: number; saleValue: number }>();
    // Group by supplier
    const bySupplier = new Map<string, { units: number; costValue: number; saleValue: number }>();

    let totalUnits = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;

    for (const inv of inventories) {
      const units = inv.currentStock;
      const costValue = units * Number(inv.product.costPrice);
      const saleValue = units * Number(inv.product.salePrice);

      totalUnits += units;
      totalCostValue += costValue;
      totalSaleValue += saleValue;

      // By category
      const categoryName = inv.product.category?.name || 'Sin categoría';
      const catData = byCategory.get(categoryName) || { units: 0, costValue: 0, saleValue: 0 };
      catData.units += units;
      catData.costValue += costValue;
      catData.saleValue += saleValue;
      byCategory.set(categoryName, catData);

      // By supplier
      const supplierName = inv.product.supplier?.name || 'Sin proveedor';
      const supData = bySupplier.get(supplierName) || { units: 0, costValue: 0, saleValue: 0 };
      supData.units += units;
      supData.costValue += costValue;
      supData.saleValue += saleValue;
      bySupplier.set(supplierName, supData);
    }

    return {
      summary: {
        totalProducts: inventories.length,
        totalUnits,
        totalCostValue,
        totalSaleValue,
        potentialProfit: totalSaleValue - totalCostValue,
        profitMargin:
          totalCostValue > 0
            ? (((totalSaleValue - totalCostValue) / totalCostValue) * 100).toFixed(2) + '%'
            : '0%',
      },
      byCategory: Array.from(byCategory.entries())
        .map(([name, data]) => ({
          category: name,
          units: data.units,
          costValue: data.costValue,
          saleValue: data.saleValue,
          profit: data.saleValue - data.costValue,
          percentageOfTotal:
            totalCostValue > 0
              ? ((data.costValue / totalCostValue) * 100).toFixed(2) + '%'
              : '0%',
        }))
        .sort((a, b) => b.costValue - a.costValue),
      bySupplier: Array.from(bySupplier.entries())
        .map(([name, data]) => ({
          supplier: name,
          units: data.units,
          costValue: data.costValue,
          saleValue: data.saleValue,
          profit: data.saleValue - data.costValue,
          percentageOfTotal:
            totalCostValue > 0
              ? ((data.costValue / totalCostValue) * 100).toFixed(2) + '%'
              : '0%',
        }))
        .sort((a, b) => b.costValue - a.costValue),
    };
  }

  async getLowStockReport() {
    const lowStockProducts = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('inventory.currentStock <= product.reorderPoint')
      .orderBy('inventory.currentStock', 'ASC')
      .getMany();

    return {
      data: lowStockProducts.map((inv) => ({
        productId: inv.productId,
        sku: inv.product.sku,
        name: inv.product.name,
        category: inv.product.category?.name || 'Sin categoría',
        supplier: inv.product.supplier?.name || 'Sin proveedor',
        currentStock: inv.currentStock,
        reorderPoint: inv.product.reorderPoint,
        deficit: inv.product.reorderPoint - inv.currentStock,
        costPrice: Number(inv.product.costPrice),
        estimatedReorderCost:
          (inv.product.reorderPoint - inv.currentStock) *
          Number(inv.product.costPrice),
        lastMovementAt: inv.lastMovementAt,
        supplierContact: inv.product.supplier?.contactEmail || 'N/A',
      })),
      summary: {
        totalLowStockProducts: lowStockProducts.length,
        totalDeficitUnits: lowStockProducts.reduce(
          (sum, inv) => sum + Math.max(0, inv.product.reorderPoint - inv.currentStock),
          0,
        ),
        estimatedReorderCost: lowStockProducts.reduce(
          (sum, inv) =>
            sum +
            Math.max(0, inv.product.reorderPoint - inv.currentStock) *
              Number(inv.product.costPrice),
          0,
        ),
        criticalProducts: lowStockProducts.filter((inv) => inv.currentStock === 0)
          .length,
      },
    };
  }

  async getDashboardSummary() {
    // Total products
    const totalProducts = await this.productRepository.count({
      where: { status: ProductStatus.ACTIVE },
    });

    // Total inventory value
    const inventories = await this.inventoryRepository.find({
      relations: ['product'],
    });

    const totalValue = inventories.reduce((sum, inv) => {
      return sum + inv.currentStock * Number(inv.product?.costPrice || 0);
    }, 0);

    const totalUnits = inventories.reduce((sum, inv) => sum + inv.currentStock, 0);

    // Low stock count
    const lowStockCount = inventories.filter(
      (inv) => inv.currentStock <= (inv.product?.reorderPoint || 0),
    ).length;

    // Out of stock
    const outOfStock = inventories.filter((inv) => inv.currentStock === 0).length;

    // Recent movements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMovements = await this.movementRepository
      .createQueryBuilder('movement')
      .where('movement.createdAt >= :date', { date: sevenDaysAgo })
      .getCount();

    // Categories count
    const categoriesCount = await this.categoryRepository.count({
      where: { status: 'active' },
    });

    // Suppliers count
    const suppliersCount = await this.supplierRepository.count({
      where: { status: 'active' },
    });

    return {
      inventory: {
        totalProducts,
        totalUnits,
        totalValue,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStock,
      },
      activity: {
        recentMovements,
        period: 'Last 7 days',
      },
      catalog: {
        categories: categoriesCount,
        suppliers: suppliersCount,
      },
    };
  }
}
