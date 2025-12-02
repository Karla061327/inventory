import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryEntryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'ORD-2024-001' })
  @IsString()
  @IsOptional()
  referenceDoc?: string;

  @ApiPropertyOptional({ example: 'Compra a Tech Supplies Inc' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  supplierId?: number;
}
