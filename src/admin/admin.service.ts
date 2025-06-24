import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { OrderStatus, PaymentStatus } from '../orders/schemas/order.schema';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalOrders(),
      this.getPendingOrders(),
      this.getCompletedOrders(),
      this.getTotalRevenue(),
    ]);

    return {
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  }

  async getRecentActivity() {
    const recentOrders = await this.ordersService.findAll({ page: 1, limit: 10 });
    const recentUsers = await this.usersService.findAll({ page: 1, limit: 10 });

    return {
      recentOrders: recentOrders.orders,
      recentUsers: recentUsers.users,
    };
  }

  async getOrderStatusDistribution() {
    // This would typically be done with aggregation in a real implementation
    const statuses = Object.values(OrderStatus);
    const distribution = {};

    for (const status of statuses) {
      const result = await this.ordersService.getOrdersByStatus(status, { page: 1, limit: 1 });
      distribution[status] = result.pagination.total;
    }

    return distribution;
  }

  async getMonthlyRevenue() {
    // This would typically be done with aggregation in MongoDB
    // For now, returning mock data structure
    const currentYear = new Date().getFullYear();
    const months = [];

    for (let i = 0; i < 12; i++) {
      months.push({
        month: new Date(currentYear, i).toLocaleString('default', { month: 'long' }),
        revenue: 0, // Would be calculated from actual orders
      });
    }

    return months;
  }

  private async getTotalUsers(): Promise<number> {
    const result = await this.usersService.findAll({ page: 1, limit: 1 });
    return result.pagination.total;
  }

  private async getTotalOrders(): Promise<number> {
    const result = await this.ordersService.findAll({ page: 1, limit: 1 });
    return result.pagination.total;
  }

  private async getPendingOrders(): Promise<number> {
    const result = await this.ordersService.getOrdersByStatus(OrderStatus.PENDING, { page: 1, limit: 1 });
    return result.pagination.total;
  }

  private async getCompletedOrders(): Promise<number> {
    const result = await this.ordersService.getOrdersByStatus(OrderStatus.DELIVERED, { page: 1, limit: 1 });
    return result.pagination.total;
  }

  private async getTotalRevenue(): Promise<number> {
    // This would typically be calculated using MongoDB aggregation
    // For now, returning 0 as placeholder
    return 0;
  }
}