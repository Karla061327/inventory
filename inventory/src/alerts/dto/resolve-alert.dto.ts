import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResolveAlertDto {
  @ApiPropertyOptional({
    description: 'Notes about how the alert was resolved',
    example: 'Stock replenished with order ORD-2024-001',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
