import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType } from '../../common/enums';

export class CreateAlertDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Type of alert',
    enum: AlertType,
    example: AlertType.LOW_STOCK,
  })
  @IsEnum(AlertType)
  alertType: AlertType;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Stock crítico' })
  @IsOptional()
  @IsString()
  notes?: string;
}
