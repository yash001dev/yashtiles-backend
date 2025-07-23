import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument, OrderStatus } from "./schemas/order.schema";
import { Counter } from "./schemas/counter.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { BulkUpdateOrderDto } from "./dto/bulk-update-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { SearchOrderDto } from "./dto/search-order.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
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

    // Send status update email
    await this.notificationsService.sendOrderStatusUpdateEmail(
      order.shippingAddress.email,
      order.shippingAddress.firstName,
      order
    );

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

  async bulkUpdateOrders(
    bulkUpdateOrderDto: BulkUpdateOrderDto
  ): Promise<{ updated: number; failed: string[] }> {
    const { orderIds, status, paymentStatus, trackingNumber, notes } =
      bulkUpdateOrderDto;
    const failed: string[] = [];
    let updated = 0;

    for (const orderId of orderIds) {
      try {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
          failed.push(`Order ${orderId} not found`);
          continue;
        }

        const updateData: any = {};

        if (status !== undefined) {
          updateData.status = status;
          // Add to status history
          order.statusHistory.push({
            status,
            timestamp: new Date(),
            notes,
          });
        }

        if (paymentStatus !== undefined) {
          updateData.paymentStatus = paymentStatus;
        }

        if (trackingNumber !== undefined) {
          updateData.trackingNumber = trackingNumber;
        }

        await this.orderModel.findByIdAndUpdate(orderId, updateData).exec();
        await order.save();

        // Send email notification if status was updated
        if (status !== undefined) {
          try {
            await this.notificationsService.sendOrderStatusUpdateEmail(
              order.shippingAddress.email,
              order.shippingAddress.firstName,
              order
            );
          } catch (emailError) {
            console.error(
              `Failed to send email for order ${orderId}:`,
              emailError
            );
            // Don't fail the bulk update if email fails, just log it
          }
        }

        updated++;
      } catch (error) {
        failed.push(`Order ${orderId}: ${error.message}`);
      }
    }

    return { updated, failed };
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto
  ): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const updateData: any = {};

    // Handle status update with history
    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
      order.statusHistory.push({
        status: updateOrderDto.status,
        timestamp: new Date(),
        notes: updateOrderDto.statusNotes,
      });
    }

    // Handle other simple fields
    const simpleFields = [
      "paymentStatus",
      "totalAmount",
      "shippingCost",
      "taxAmount",
      "paymentId",
      "paymentMethod",
      "trackingNumber",
      "estimatedDelivery",
      "notes",
    ];

    simpleFields.forEach((field) => {
      if (updateOrderDto[field] !== undefined) {
        updateData[field] = updateOrderDto[field];
      }
    });

    // Handle shipping address update
    if (updateOrderDto.shippingAddress) {
      const currentShippingAddress = order.shippingAddress;
      updateData.shippingAddress = {
        ...currentShippingAddress,
        ...updateOrderDto.shippingAddress,
      };
    }

    // Handle items update
    if (updateOrderDto.items) {
      updateData.items = updateOrderDto.items.map((item, index) => {
        const currentItem = order.items[index] || {};
        return {
          ...currentItem,
          ...item,
        };
      });
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    await order.save(); // Save status history changes

    // Send email notification if status was updated
    if (updateOrderDto.status !== undefined) {
      try {
        await this.notificationsService.sendOrderStatusUpdateEmail(
          updatedOrder.shippingAddress.email,
          updatedOrder.shippingAddress.firstName,
          updatedOrder
        );
      } catch (emailError) {
        console.error(
          `Failed to send status update email for order ${id}:`,
          emailError
        );
        // Don't fail the update if email fails, just log it
      }
    }

    return updatedOrder;
  }

  async searchOrders(searchOrderDto: SearchOrderDto) {
    const {
      page,
      limit,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      status,
      paymentStatus,
      fromDate,
      toDate,
      trackingNumber,
      minAmount,
      maxAmount,
    } = searchOrderDto;

    const skip = (page - 1) * limit;
    const filter: any = {};

    // Build search filters
    if (orderNumber) {
      filter.orderNumber = { $regex: orderNumber, $options: "i" };
    }

    if (customerEmail) {
      filter["shippingAddress.email"] = {
        $regex: customerEmail,
        $options: "i",
      };
    }

    if (customerName) {
      filter.$or = [
        {
          "shippingAddress.firstName": { $regex: customerName, $options: "i" },
        },
        { "shippingAddress.lastName": { $regex: customerName, $options: "i" } },
      ];
    }

    if (customerPhone) {
      filter["shippingAddress.phone"] = {
        $regex: customerPhone,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      filter.trackingNumber = { $regex: trackingNumber, $options: "i" };
    }

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filter.createdAt.$lte = endDate;
      }
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.totalAmount = {};
      if (minAmount !== undefined) {
        filter.totalAmount.$gte = minAmount;
      }
      if (maxAmount !== undefined) {
        filter.totalAmount.$lte = maxAmount;
      }
    }

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

  // Atomic daily order number generator using a counters collection
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const todayKey = `${year}${month}${day}`;

    // Atomically increment the counter for today
    const counterDoc = await this.counterModel.findOneAndUpdate(
      { _id: `orderNumber_${todayKey}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const sequence = counterDoc.seq.toString().padStart(4, "0");
    return `FR${todayKey}${sequence}`;
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
