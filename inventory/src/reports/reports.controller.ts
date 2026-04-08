import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { MovementsReportDto, InventoryReportDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary data' })
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report with stock levels and values' })
  @ApiResponse({ status: 200, description: 'Inventory report' })
  getInventoryReport(@Query() filters: InventoryReportDto) {
    return this.reportsService.getInventoryReport(filters);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get movements report by date range' })
  @ApiResponse({ status: 200, description: 'Movements report' })
  getMovementsReport(@Query() filters: MovementsReportDto) {
    return this.reportsService.getMovementsReport(filters);
  }

  @Get('value')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get inventory value report by category and supplier' })
  @ApiResponse({ status: 200, description: 'Value report' })
  getValueReport(@Query() filters: InventoryReportDto) {
    return this.reportsService.getValueReport(filters);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products report' })
  @ApiResponse({ status: 200, description: 'Low stock report' })
  getLowStockReport() {
    return this.reportsService.getLowStockReport();
  }
}
