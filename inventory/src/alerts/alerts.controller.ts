import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { AlertsService } from './alerts.service';
import { CreateAlertDto, QueryAlertsDto, ResolveAlertDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new alert manually' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts with filters' })
  @ApiResponse({ status: 200, description: 'List of alerts' })
  findAll(@Query() query: QueryAlertsDto) {
    return this.alertsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get alerts summary statistics' })
  @ApiResponse({ status: 200, description: 'Alerts summary' })
  getSummary() {
    return this.alertsService.getAlertsSummary();
  }

  @Get('unresolved')
  @ApiOperation({ summary: 'Get all unresolved alerts' })
  @ApiResponse({ status: 200, description: 'List of unresolved alerts' })
  getUnresolved(@Query() query: QueryAlertsDto) {
    return this.alertsService.findAll({ ...query, isResolved: 'false' });
  }

  @Post('check')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Run manual alert check (low stock, no movement, etc.)' })
  @ApiResponse({ status: 200, description: 'Check completed, new alerts created' })
  runManualCheck() {
    return this.alertsService.runManualCheck();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert details' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Mark alert as resolved' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 400, description: 'Alert already resolved' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() resolveAlertDto?: ResolveAlertDto,
  ) {
    return this.alertsService.resolve(id, user.id, resolveAlertDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an alert (Admin only)' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }
}
