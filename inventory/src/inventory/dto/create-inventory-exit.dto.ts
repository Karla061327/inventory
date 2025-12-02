import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '../../common/enums';

export class CreateInventoryExitDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: [MovementType.SALE, MovementType.DAMAGED, MovementType.LOSS], example: MovementType.SALE })
  @IsEnum([MovementType.SALE, MovementType.DAMAGED, MovementType.LOSS])
  exitType: MovementType;

  @ApiPropertyOptional({ example: 'VTA-2024-001' })
  @IsString()
  @IsOptional()
  referenceDoc?: string;

  @ApiPropertyOptional({ example: 'Venta al cliente Juan Pérez' })
  @IsString()
  @IsOptional()
  notes?: string;
}
