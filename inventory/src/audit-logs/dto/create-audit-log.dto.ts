import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsNumber()
  userId: number;

  @IsString()
  tableName: string;

  @IsNumber()
  recordId: number;

  @IsString()
  action: string;

  @IsOptional()
  oldValues?: any;

  @IsOptional()
  newValues?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
