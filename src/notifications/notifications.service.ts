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
    // Initialize email transporter with enhanced configuration
    console.log(
      "this.configService.get<string>('SMTP_HOST')",
      this.configService.get<string>("SMTP_HOST")
    );
    console.log(
      "this.configService.get<number>('SMTP_PORT')",
      this.configService.get<number>("SMTP_PORT")
    );
    console.log(
      "this.configService.get<string>('SMTP_USER')",
      this.configService.get<string>("SMTP_USER")
    );
    console.log(
      "this.configService.get<string>('SMTP_PASS')",
      this.configService.get<string>("SMTP_PASS")
    );
    this.transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail service for better compatibility
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Initialize Twilio client - COMMENTED OUT FOR NOW
    // this.twilioClient = new Twilio(
    //   this.configService.get<string>('TWILIO_ACCOUNT_SID'),
    //   this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    // );
  }

  async sendWelcomeEmailWithVerification(
    email: string,
    firstName: string,
    verificationToken: string
  ) {
    try {
      const verificationUrl = `${this.configService.get<string>("FRONTEND_URL")}/verify-email?token=${verificationToken}&email=${email}`;

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Welcome to Framely! Please verify your email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">Welcome to Framely! 🖼️</h1>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #34495e; font-size: 20px;">Hi ${firstName}!</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Thank you for joining our community of photo frame enthusiasts! We're excited to help you create beautiful custom frames for your precious memories.
                </p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3498db;">
                <h3 style="color: #2c3e50; margin-top: 0; font-size: 18px;">📧 Please verify your email address</h3>
                <p style="color: #555; margin-bottom: 20px;">
                  To complete your registration and start using Framely, please verify your email address by clicking the button below:
                </p>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);">
                    ✅ Verify Email Address
                  </a>
                </div>
                <p style="color: #777; font-size: 14px; margin-bottom: 0;">
                  This verification link will expire in 24 hours for security reasons.
                </p>
              </div>

              <div style="margin-top: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px;">🎨 What you can do with Framely:</h3>
                <ul style="color: #555; padding-left: 20px;">
                  <li>Create beautiful custom photo frames</li>
                  <li>Upload and edit your favorite photos</li>
                  <li>Choose from various frame styles and sizes</li>
                  <li>Order high-quality prints delivered to your door</li>
                </ul>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #777; font-size: 14px; margin-bottom: 10px;">
                  If you can't click the button above, copy and paste this link into your browser:
                </p>
                <p style="color: #3498db; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                  ${verificationUrl}
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #555; font-size: 16px; margin: 0;">
                  Welcome aboard!<br>
                  <strong>The Framely Team</strong> 📸
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send welcome email with verification:", error);
    }
  }

  async sendEmailVerificationOnly(
    email: string,
    firstName: string,
    verificationToken: string
  ) {
    try {
      const verificationUrl = `${this.configService.get<string>("FRONTEND_URL")}/verify-email?token=${verificationToken}&email=${email}`;

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Verify your Framely email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📧 Email Verification</h1>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #34495e; font-size: 18px;">Hi ${firstName}!</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Please verify your email address to complete your account setup and access all Framely features.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);">
                  ✅ Verify Email Address
                </a>
              </div>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #777; font-size: 14px; margin: 0;">
                  This verification link will expire in 24 hours for security reasons.
                </p>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #777; font-size: 14px; margin-bottom: 10px;">
                  If you can't click the button above, copy and paste this link into your browser:
                </p>
                <p style="color: #3498db; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                  ${verificationUrl}
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #555; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The Framely Team</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send email verification:", error);
    }
  }

  async sendEmailVerificationSuccess(email: string, firstName: string) {
    try {
      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: "Email verified successfully! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #27ae60; margin: 0; font-size: 28px;">🎉 Email Verified!</h1>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #34495e; font-size: 20px;">Congratulations ${firstName}!</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Your email has been successfully verified! You now have full access to all Framely features.
                </p>
              </div>

              <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #27ae60;">
                <h3 style="color: #1e8449; margin-top: 0; font-size: 18px;">🚀 You're all set!</h3>
                <p style="color: #1e8449; margin-bottom: 0;">
                  Start exploring our collection and create your first custom photo frame today!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get<string>("FRONTEND_URL")}" style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(39, 174, 96, 0.3);">
                  🖼️ Start Creating Frames
                </a>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #555; font-size: 16px; margin: 0;">
                  Happy framing!<br>
                  <strong>The Framely Team</strong> 📸
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send email verification success:", error);
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
