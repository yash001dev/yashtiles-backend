import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument, OrderStatus } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private notificationsService: NotificationsService
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    sendEmail: boolean = true
  ): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      ...createOrderDto,
      userId,
      orderNumber,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
        },
      ],
    });
    const savedOrder = await order.save();
    // Note: productId is now a string identifier, not a Product reference

    // Send order confirmation email only if sendEmail is true
    if (sendEmail) {
      await this.notificationsService.sendOrderConfirmationEmail(
        savedOrder.shippingAddress.email,
        savedOrder.shippingAddress.firstName,
        savedOrder
      );
    }

    // Send WhatsApp notification - COMMENTED OUT FOR NOW
    // if (savedOrder.shippingAddress.phone) {
    //   await this.notificationsService.sendOrderConfirmationWhatsApp(
    //     savedOrder.shippingAddress.phone,
    //     savedOrder.shippingAddress.firstName,
    //     savedOrder.orderNumber,
    //   );
    // }

    return savedOrder;
  }

  async findAll(paginationDto: PaginationDto, userId?: string) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const filter = userId ? { userId } : {};

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const filter: any = { _id: id };
    if (userId) {
      filter.userId = userId;
    }

    const order = await this.orderModel.findOne(filter).exec();

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto
  ): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Add to status history
    order.statusHistory.push({
      status: updateOrderStatusDto.status,
      timestamp: new Date(),
      notes: updateOrderStatusDto.notes,
    });

    // Update current status
    order.status = updateOrderStatusDto.status;

    // Update payment-related fields if provided
    if (updateOrderStatusDto.paymentStatus !== undefined) {
      order.paymentStatus = updateOrderStatusDto.paymentStatus;
    }

    if (updateOrderStatusDto.paymentId) {
      order.paymentId = updateOrderStatusDto.paymentId;
    }

    if (updateOrderStatusDto.paymentMethod) {
      order.paymentMethod = updateOrderStatusDto.paymentMethod;
    }

    if (updateOrderStatusDto.trackingNumber) {
      order.trackingNumber = updateOrderStatusDto.trackingNumber;
    }

    if (updateOrderStatusDto.estimatedDelivery) {
      order.estimatedDelivery = updateOrderStatusDto.estimatedDelivery;
    }

    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    // Note: productId is now a string identifier, not a Product reference

    // Send status update notifications
    await this.notificationsService.sendOrderStatusUpdateEmail(
      updatedOrder.shippingAddress.email,
      updatedOrder.shippingAddress.firstName,
      updatedOrder
    );

    // Send WhatsApp notification - COMMENTED OUT FOR NOW
    // if (updatedOrder.shippingAddress.phone) {
    //   await this.notificationsService.sendOrderStatusUpdateWhatsApp(
    //     updatedOrder.shippingAddress.phone,
    //     updatedOrder.shippingAddress.firstName,
    //     updatedOrder.orderNumber,
    //     updatedOrder.status,
    //   );
    // }

    return updatedOrder;
  }

  async getOrdersByStatus(status: OrderStatus, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ status })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments({ status }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const count = await this.orderModel.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    return `FR${year}${month}${day}${sequence}`;
  }

  async getOrderByTxnId(txnid: string): Promise<OrderDocument | null> {
    console.log(`Looking for order with txnid: ${txnid}`);
    const order = await this.orderModel.findOne({ txnid }).exec();
    console.log(`Order found: ${order ? "Yes" : "No"}`);
    if (order) {
      console.log(`Order ID: ${order._id}, Status: ${order.status}`);
    }
    return order;
  }
}
