import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { AlertType } from '../../common/enums';

export class QueryAlertsDto {
  @ApiPropertyOptional({ description: 'Filter by product ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({
    description: 'Filter by alert type',
    enum: AlertType,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(AlertType)
  alertType?: AlertType;

  @ApiPropertyOptional({ description: 'Filter by resolved status', example: 'false' })
  @IsOptional()
  @IsIn(['true', 'false'])
  isResolved?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
