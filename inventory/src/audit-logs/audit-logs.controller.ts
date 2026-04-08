import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get audit logs summary statistics' })
  @ApiResponse({ status: 200, description: 'Audit logs summary' })
  getSummary() {
    return this.auditLogsService.getSummary();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User audit logs' })
  getByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryAuditLogsDto,
  ) {
    return this.auditLogsService.getByUser(userId, query);
  }

  @Get('record/:tableName/:recordId')
  @ApiOperation({ summary: 'Get audit logs for a specific record' })
  @ApiParam({ name: 'tableName', description: 'Table name (e.g., products, users)' })
  @ApiParam({ name: 'recordId', description: 'Record ID' })
  @ApiResponse({ status: 200, description: 'Record audit history' })
  getByRecord(
    @Param('tableName') tableName: string,
    @Param('recordId', ParseIntPipe) recordId: number,
  ) {
    return this.auditLogsService.getByRecord(tableName, recordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findOne(id);
  }
}
