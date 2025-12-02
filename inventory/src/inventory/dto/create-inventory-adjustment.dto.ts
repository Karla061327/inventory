import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryAdjustmentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 100, description: 'Nueva cantidad de stock (no incremento/decremento)' })
  @IsNumber()
  @IsNotEmpty()
  newQuantity: number;

  @ApiProperty({ example: 'Conteo físico de inventario' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'https://example.com/evidence.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
