import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ProductStatus } from '../../common/enums';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Laptop Dell XPS 15' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '5901234123457' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ example: 'Laptop de alto rendimiento con pantalla 4K' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @IsPositive()
  costPrice: number;

  @ApiProperty({ example: 1499.99 })
  @IsNumber()
  @IsPositive()
  salePrice: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'https://example.com/images/laptop.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  supplierId?: number;
}
