import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
// import { Twilio } from 'twilio';
import { Order, OrderStatus } from "../orders/schemas/order.schema";

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  // private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false,
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });

    // Initialize Twilio client - COMMENTED OUT FOR NOW
    // this.twilioClient = new Twilio(
    //   this.configService.get<string>('TWILIO_ACCOUNT_SID'),
    //   this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    // );
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Welcome to Framely!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Framely, ${firstName}!</h1>
            <p>Thank you for joining our community of photo frame enthusiasts.</p>
            <p>We're excited to help you create beautiful custom frames for your precious memories.</p>
            <p>Get started by browsing our collection of frames and uploading your favorite photos.</p>
            <p>Best regards,<br>The Framely Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ) {
    try {
      const resetUrl = `${this.configService.get<string>("FRONTEND_URL")}/reset-password?token=${resetToken}&email=${email}`;

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Reset Your Framely Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p>Hi ${firstName},</p>
            <p>You requested to reset your password for your Framely account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Framely Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  async sendPasswordChangedEmail(email: string, firstName: string) {
    try {
      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Password Changed Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Changed</h1>
            <p>Hi ${firstName},</p>
            <p>Your Framely account password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Framely Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send password changed email:", error);
    }
  }

  async sendOrderConfirmationEmail(
    email: string,
    firstName: string,
    order: Order
  ) {
    try {
      const itemsHtml = order.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${item.imageUrl}" alt="Frame" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.size} - ${item.frameType}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
        )
        .join("");

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Order Confirmation</h1>
            <p>Hi ${firstName},</p>
            <p>Thank you for your order! We've received your order and will start processing it soon.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            </div>

            <h3>Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Image</th>
                  <th style="padding: 10px; text-align: left;">Details</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p>
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>

            <p>We'll send you another email when your order ships with tracking information.</p>
            <p>Best regards,<br>The Framely Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
    }
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    firstName: string,
    order: Order
  ) {
    try {
      const statusMessages = {
        [OrderStatus.CONFIRMED]:
          "Your order has been confirmed and is being prepared.",
        [OrderStatus.PROCESSING]: "Your order is currently being processed.",
        [OrderStatus.SHIPPED]: "Great news! Your order has been shipped.",
        [OrderStatus.DELIVERED]: "Your order has been delivered successfully.",
        [OrderStatus.CANCELLED]: "Your order has been cancelled.",
      };

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `Order Update - ${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Order Status Update</h1>
            <p>Hi ${firstName},</p>
            <p>Your order <strong>${order.orderNumber}</strong> status has been updated.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Current Status: ${order.status.toUpperCase()}</h3>
              <p>${statusMessages[order.status]}</p>
              ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
              ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ""}
            </div>

            <p>Thank you for choosing Framely!</p>
            <p>Best regards,<br>The Framely Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send order status update email:", error);
    }
  }

  // WHATSAPP AND SMS METHODS - COMMENTED OUT FOR NOW
  /*
  async sendOrderConfirmationWhatsApp(phone: string, firstName: string, orderNumber: string) {
    try {
      const message = `Hi ${firstName}! 🎉 Your Framely order ${orderNumber} has been confirmed. We'll start processing it soon and keep you updated. Thank you for choosing us!`;

      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_WHATSAPP_FROM'),
        to: `whatsapp:${phone}`,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp confirmation:', error);
    }
  }

  async sendOrderStatusUpdateWhatsApp(phone: string, firstName: string, orderNumber: string, status: OrderStatus) {
    try {
      const statusMessages = {
        [OrderStatus.CONFIRMED]: '✅ Your order has been confirmed!',
        [OrderStatus.PROCESSING]: '🔄 Your order is being processed.',
        [OrderStatus.SHIPPED]: '🚚 Your order has been shipped!',
        [OrderStatus.DELIVERED]: '📦 Your order has been delivered!',
        [OrderStatus.CANCELLED]: '❌ Your order has been cancelled.',
      };

      const message = `Hi ${firstName}! ${statusMessages[status]} Order: ${orderNumber}. Thanks for choosing Framely! 📸`;

      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_WHATSAPP_FROM'),
        to: `whatsapp:${phone}`,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp status update:', error);
    }
  }
  */
}
