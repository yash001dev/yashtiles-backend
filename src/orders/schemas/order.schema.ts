import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop([{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    frameType: { type: String, required: true },
    imageUrl: { type: String, required: true },
    notes: String,
  }])
  items: Array<{
    productId: String;
    quantity: number;
    price: number;
    size: string;
    frameType: string;
    imageUrl: string;
    notes?: string;
    frameColor?: string;
    borderColor?: string;
    borderWidth?: string;
    material?: string;
    effect?: string;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  txnid: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentId?: string;

  @Prop()
  paymentMethod?: string;

  @Prop({
    type: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    required: true,
  })
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop()
  trackingNumber?: string;

  @Prop()
  estimatedDelivery?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  notes?: string;

  @Prop([{
    status: { type: String, enum: OrderStatus },
    timestamp: { type: Date, default: Date.now },
    notes: String,
  }])
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    notes?: string;
  }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });