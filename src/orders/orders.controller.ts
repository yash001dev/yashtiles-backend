import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateOrderDto } from './dto/bulk-update-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { OrderStatus } from './schemas/order.schema';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders with pagination' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
    return this.ordersService.findAll(paginationDto, userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  @ApiQuery({ name: 'status', enum: OrderStatus })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  getOrdersByStatus(
    @Param('status') status: OrderStatus,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getOrdersByStatus(status, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
    return this.ordersService.findOne(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update multiple orders' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  bulkUpdateOrders(@Body() bulkUpdateOrderDto: BulkUpdateOrderDto) {
    return this.ordersService.bulkUpdateOrders(bulkUpdateOrderDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order details (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Get('admin/search')
  @ApiOperation({ summary: 'Search orders with filters (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  searchOrders(@Query() searchOrderDto: SearchOrderDto) {
    return this.ordersService.searchOrders(searchOrderDto);
  }
}