import {
  Controller,
  Get,
  Post,
  Body,
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
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryEntryDto,
  CreateInventoryExitDto,
  CreateInventoryAdjustmentDto,
  QueryMovementsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('inventory') 
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('entry')
  @ApiOperation({ summary: 'Register inventory entry (purchase/receipt)' })
  @ApiResponse({ status: 201, description: 'Stock entry registered successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  createEntry(
    @Body() dto: CreateInventoryEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createEntry(dto, user.userId);
  }

  @Post('exit')
  @ApiOperation({ summary: 'Register inventory exit (sale/loss/damage)' })
  @ApiResponse({ status: 201, description: 'Stock exit registered successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  createExit(
    @Body() dto: CreateInventoryExitDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createExit(dto, user.userId);
  }

  @Post('adjustment')
  @ApiOperation({ summary: 'Adjust inventory (physical count)' })
  @ApiResponse({ status: 201, description: 'Inventory adjusted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Adjustments >10% require evidence',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  createAdjustment(
    @Body() dto: CreateInventoryAdjustmentDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createAdjustment(dto, user.userId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get inventory movements history' })
  @ApiResponse({ status: 200, description: 'Return movements with pagination' })
  getMovements(@Query() query: QueryMovementsDto) {
    return this.inventoryService.getMovements(query);
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Get current stock for a product' })
  @ApiResponse({ status: 200, description: 'Return current stock information' })
  @ApiResponse({ status: 404, description: 'Inventory record not found' })
  getCurrentStock(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.getCurrentStock(productId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory with summary' })
  @ApiResponse({ status: 200, description: 'Return all inventory records' })
  getAllInventory() {
    return this.inventoryService.getAllInventory();
  }
}
