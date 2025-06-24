import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get recent activity' })
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('dashboard/order-distribution')
  @ApiOperation({ summary: 'Get order status distribution' })
  getOrderStatusDistribution() {
    return this.adminService.getOrderStatusDistribution();
  }

  @Get('dashboard/monthly-revenue')
  @ApiOperation({ summary: 'Get monthly revenue data' })
  getMonthlyRevenue() {
    return this.adminService.getMonthlyRevenue();
  }
}