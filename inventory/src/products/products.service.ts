import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingSku = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    if (createProductDto.barcode) {
      const existingBarcode = await this.productRepository.findOne({
        where: { barcode: createProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    if (createProductDto.salePrice <= createProductDto.costPrice) {
      throw new BadRequestException(
        'Sale price must be greater than cost price',
      );
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    const inventory = this.inventoryRepository.create({
      productId: savedProduct.id,
      currentStock: 0,
    });
    await this.inventoryRepository.save(inventory);

    return savedProduct;
  }

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 25, search, categoryId, status, sortBy, order } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .leftJoinAndSelect('product.inventory', 'inventory');

    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    let orderColumn = 'product.name';
    if (sortBy === 'sku') orderColumn = 'product.sku';
    if (sortBy === 'price') orderColumn = 'product.salePrice';
    if (sortBy === 'stock') orderColumn = 'inventory.currentStock';

    queryBuilder.orderBy(orderColumn, order);

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'supplier', 'inventory'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { sku },
      relations: ['category', 'supplier', 'inventory'],
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode },
      relations: ['category', 'supplier', 'inventory'],
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existingBarcode = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    const salePrice = updateProductDto.salePrice || product.salePrice;
    const costPrice = updateProductDto.costPrice || product.costPrice;

    if (salePrice <= costPrice) {
      throw new BadRequestException(
        'Sale price must be greater than cost price',
      );
    }

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.status = 'inactive' as any;
    await this.productRepository.save(product);
  }
}
