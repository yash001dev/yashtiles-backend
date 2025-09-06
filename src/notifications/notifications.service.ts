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
        subject: "Welcome to PhotoFramix! Please verify your email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://frameit-website-assets.s3.ap-south-1.amazonaws.com/favicon.svg" alt="PhotoFramix Logo" style="height: 48px; margin-bottom: 16px;" />
                <h1 style="color: #ec4899; margin: 0; font-size: 28px;">Welcome to PhotoFramix! 🖼️</h1>
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
                  To complete your registration and start using PhotoFramix, please verify your email address by clicking the button below:
                </p>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${verificationUrl}" style="background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);">
                    ✅ Verify Email Address
                  </a>
                </div>
                <p style="color: #777; font-size: 14px; margin-bottom: 0;">
                  This verification link will expire in 24 hours for security reasons.
                </p>
              </div>

              <div style="margin-top: 30px;">
                <h3 style="color: #ec4899; font-size: 18px;">🎨 What you can do with PhotoFramix:</h3>
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
                  <strong>The PhotoFramix Team</strong> 🖼️
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
        subject: "Verify your PhotoFramix email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📧 Email Verification</h1>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #34495e; font-size: 18px;">Hi ${firstName}!</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Please verify your email address to complete your account setup and access all PhotoFramix features.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);">
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
                  <strong>The PhotoFramix Team</strong>
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
                  Your email has been successfully verified! You now have full access to all PhotoFramix features.
                </p>
              </div>

              <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #27ae60;">
                <h3 style="color: #1e8449; margin-top: 0; font-size: 18px;">🚀 You're all set!</h3>
                <p style="color: #1e8449; margin-bottom: 0;">
                  Start exploring our collection and create your first custom photo frame today!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get<string>("FRONTEND_URL")}" style="background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);">
                  🖼️ Start Creating Frames
                </a>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #555; font-size: 16px; margin: 0;">
                  Happy framing!<br>
                  <strong>The PhotoFramix Team</strong> 🖼️
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
        subject: "Reset Your PhotoFramix Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p>Hi ${firstName},</p>
            <p>You requested to reset your password for your PhotoFramix account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);">Reset Password</a>
            </div>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The PhotoFramix Team</p>
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
            <p>Your PhotoFramix account password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The PhotoFramix Team</p>
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
            ₹${item.price.toFixed(2)}
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
            
            <div style="background: linear-gradient(90deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ec4899;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
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
            <p>Best regards,<br>The PhotoFramix Team</p>
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
        [OrderStatus.CONFIRMED]: {
          message: "Your order has been confirmed and is being prepared with care.",
          icon: "✅",
          color: "#2e7d32",
          bgColor: "#e8f5e8"
        },
        [OrderStatus.PROCESSING]: {
          message: "Your custom frames are being crafted by our skilled artisans.",
          icon: "🔨",
          color: "#ed6c02",
          bgColor: "#fff3e0"
        },
        [OrderStatus.SHIPPED]: {
          message: "Exciting news! Your beautiful frames are on their way to you.",
          icon: "🚚",
          color: "#1976d2",
          bgColor: "#e3f2fd"
        },
        [OrderStatus.DELIVERED]: {
          message: "Your frames have arrived! We hope you love them.",
          icon: "🎉",
          color: "#388e3c",
          bgColor: "#e8f5e8"
        },
        [OrderStatus.CANCELLED]: {
          message: "Your order has been cancelled. If you have any questions, please contact us.",
          icon: "❌",
          color: "#d32f2f",
          bgColor: "#ffebee"
        },
      };

      const currentStatus = statusMessages[order.status];
      const progressPercentage = this.getStatusProgress(order.status);

      // Create items HTML for order summary
      const itemsHtml = order.items.map(item => `
        <div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; background: #fafafa;">
          <img src="${item.imageUrl}" alt="Frame Preview" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; border: 2px solid #ddd;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${item.size} Custom Frame</div>
            <div style="color: #666; font-size: 14px;">${item.frameType} • Quantity: ${item.quantity}</div>
            ${item.notes ? `<div style="color: #888; font-size: 12px; margin-top: 2px;">${item.notes}</div>` : ''}
          </div>
          <div style="font-weight: 600; color: #2e7d32;">₹${item.price.toFixed(2)}</div>
        </div>
      `).join('');

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `${currentStatus.icon} Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)} - ${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status Update</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            
            <!-- Email Container -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style=" padding: 40px 30px; text-align: center;">
                <img src="https://frameit-website-assets.s3.ap-south-1.amazonaws.com/favicon.svg" alt="PhotoFramix Logo" style="height: 40px; margin-bottom: 10px;" />
                <div style="color: #ec4899; font-size: 28px; font-weight: bold; margin-bottom: 10px;">PhotoFramix</div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">Premium Custom Frames</div>
              </div>
              
              <!-- Main Content -->
              <div style="padding: 40px 30px;">
                
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                  <h1 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">Hello ${firstName}! 👋</h1>
                  <p style="color: #666; font-size: 16px; margin: 0; line-height: 1.5;">We have an exciting update about your order.</p>
                </div>
                
                <!-- Status Card -->
                <div style="background-color: ${currentStatus.bgColor}; border-left: 4px solid ${currentStatus.color}; padding: 25px; border-radius: 8px; margin: 30px 0;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 10px;">${currentStatus.icon}</span>
                    <h2 style="color: ${currentStatus.color}; margin: 0; font-size: 20px; font-weight: 600;">
                      Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </h2>
                  </div>
                  <p style="color: #333; font-size: 16px; margin: 0; line-height: 1.6;">${currentStatus.message}</p>
                </div>
                
                <!-- Progress Bar -->
                <div style="margin: 30px 0;">
                  <div style="color: #666; font-size: 14px; margin-bottom: 8px;">Order Progress</div>
                  <div style="background-color: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
                  </div>
                </div>
                
                <!-- Order Details -->
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0;">
                  <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">Order Details</h3>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #666; font-weight: 500;">Order Number:</span>
                    <span style="color: #333; font-weight: 600;">${order.orderNumber}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #666; font-weight: 500;">Order Date:</span>
                    <span style="color: #333; font-weight: 600;">${new Date((order as any).createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #666; font-weight: 500;">Total Amount:</span>
                    <span style="color: #2e7d32; font-weight: 700; font-size: 16px;">₹${order.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  ${order.trackingNumber ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #666; font-weight: 500;">Tracking Number:</span>
                    <span style="color: #1976d2; font-weight: 600; background-color: #e3f2fd; padding: 4px 8px; border-radius: 4px;">${order.trackingNumber}</span>
                  </div>
                  ` : ''}
                  
                  ${order.estimatedDelivery ? `
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666; font-weight: 500;">Estimated Delivery:</span>
                    <span style="color: #333; font-weight: 600;">${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  ` : ''}
                </div>
                
                <!-- Order Items -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">Your Items</h3>
                  ${itemsHtml}
                </div>
                
                <!-- Call to Action -->
                ${order.status === OrderStatus.SHIPPED ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Track Your Package
                  </a>
                </div>
                ` : ''}
                
                <!-- Support Info -->
                <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e3f2fd;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 18px; margin-right: 8px;">💬</span>
                    <h4 style="color: #1976d2; margin: 0; font-size: 16px;">Need Help?</h4>
                  </div>
                  <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.5;">
                    Our customer support team is here to help! Contact us at 
                    <a href="mailto:photoframix@gmail.com" style="color: #ec4899; text-decoration: none;">photoframix@gmail.com</a> 
                    or call us at <strong>+91-XXX-XXX-XXXX</strong>
                  </p>
                </div>
                
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                <div style="color: #ec4899; font-weight: 600; margin-bottom: 10px;">Thank you for choosing PhotoFramix!</div>
                <div style="color: #666; font-size: 14px; margin-bottom: 15px;">Creating beautiful memories, one frame at a time.</div>
                
                <!-- Social Links -->
                <div style="margin: 20px 0;">
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #666; text-decoration: none;">
                    📘 Facebook
                  </a>
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #666; text-decoration: none;">
                    📷 Instagram
                  </a>
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #666; text-decoration: none;">
                    🐦 Twitter
                  </a>
                </div>
                
                <div style="color: #999; font-size: 12px; margin-top: 20px;">
                  © 2025 PhotoFramix. All rights reserved.<br>
                  This email was sent to ${email}
                </div>
              </div>
              
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send order status update email:", error);
    }
  }

  private getStatusProgress(status: OrderStatus): number {
    const progressMap = {
      [OrderStatus.PENDING]: 20,
      [OrderStatus.CONFIRMED]: 40,
      [OrderStatus.PROCESSING]: 60,
      [OrderStatus.SHIPPED]: 80,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0,
      [OrderStatus.FAILED]: 0,
    };
    return progressMap[status] || 0;
  }

  async sendPaymentSuccessEmail(
    email: string,
    firstName: string,
    order: Order,
    paymentId: string,
    paymentMethod: string
  ) {
    try {
      const itemsHtml = order.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
            <img src="${item.imageUrl}" alt="Frame" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
            <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${item.size} - ${item.frameType}</div>
            <div style="color: #666; font-size: 14px;">Custom Frame</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
            <span style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-weight: 500;">${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <span style="font-weight: 600; color: #2e7d32; font-size: 16px;">₹${item.price.toFixed(2)}</span>
          </td>
        </tr>
      `
        )
        .join("");

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `🎉 Payment Successful - Order ${order.orderNumber}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 30px; text-align: center; color: white;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Successful!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your order has been confirmed and is being processed</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="font-size: 18px; color: #333; margin: 0;">Hi <strong>${firstName}</strong>,</p>
                <p style="font-size: 16px; color: #666; margin: 10px 0 0 0;">Great news! Your payment has been processed successfully and your custom frame order is confirmed.</p>
              </div>
              
              <!-- Payment Details -->
              <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ec4899;">
                <h3 style="margin-top: 0; color: #2e7d32; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">💳</span>
                  Payment Details
                </h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Payment ID:</span>
                  <span style="font-weight: 600; color: #333;">${paymentId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Payment Method:</span>
                  <span style="font-weight: 600; color: #333; text-transform: uppercase;">${paymentMethod}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Order Number:</span>
                  <span style="font-weight: 600; color: #333;">${order.orderNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #c8e6c9; padding-top: 10px; margin-top: 10px;">
                  <span style="color: #666; font-size: 18px;">Total Amount:</span>
                  <span style="font-weight: 700; color: #2e7d32; font-size: 24px;">₹${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <!-- Order Items -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📦</span>
                  Order Items
                </h3>
                <div style="background-color: #fafafa; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f5f5f5;">
                        <th style="padding: 15px; text-align: left; color: #666; font-weight: 600;">Image</th>
                        <th style="padding: 15px; text-align: left; color: #666; font-weight: 600;">Details</th>
                        <th style="padding: 15px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                        <th style="padding: 15px; text-align: right; color: #666; font-weight: 600;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Shipping Address -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h3 style="margin-top: 0; color: #333; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">🚚</span>
                  Shipping Address
                </h3>
                <div style="color: #666; line-height: 1.6;">
                  <strong style="color: #333;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong><br>
                  ${order.shippingAddress.street}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                  ${order.shippingAddress.country}
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #2196f3;">
                <h3 style="margin-top: 0; color: #1976d2; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">🔄</span>
                  What's Next?
                </h3>
                <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Your order is now being processed by our craftsmen</li>
                  <li>You'll receive tracking information once your order ships</li>
                  <li>Estimated delivery: 5-7 business days</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #666; margin: 0;">Thank you for choosing us for your custom framing needs!</p>
                <p style="color: #666; margin: 5px 0 0 0;">
                  Best regards,<br>
                  <strong style="color: #333;">The PhotoFramix Team</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment success email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send payment success email:", error);
    }
  }

  async sendPaymentFailureEmail(
    email: string,
    firstName: string,
    order: Order,
    errorMessage?: string
  ) {
    try {
      const itemsHtml = order.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
            <img src="${item.imageUrl}" alt="Frame" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
            <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${item.size} - ${item.frameType}</div>
            <div style="color: #666; font-size: 14px;">Custom Frame</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
            <span style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-weight: 500;">${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <span style="font-weight: 600; color: #d32f2f; font-size: 16px;">₹${item.price.toFixed(2)}</span>
          </td>
        </tr>
      `
        )
        .join("");

      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `❌ Payment Failed - Order ${order.orderNumber}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 30px; text-align: center; color: white;">
              <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We encountered an issue processing your payment</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="font-size: 18px; color: #333; margin: 0;">Hi <strong>${firstName}</strong>,</p>
                <p style="font-size: 16px; color: #666; margin: 10px 0 0 0;">We're sorry, but your payment could not be processed. Don't worry - no charges were made to your account.</p>
              </div>
              
              <!-- Error Details -->
              <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ec4899;">
                <h3 style="margin-top: 0; color: #2e7d32; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">⚠️</span>
                  Payment Details
                </h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Order Number:</span>
                  <span style="font-weight: 600; color: #333;">${order.orderNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Amount:</span>
                  <span style="font-weight: 600; color: #333;">₹${order.totalAmount.toFixed(2)}</span>
                </div>
                ${
                  errorMessage
                    ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Error:</span>
                  <span style="font-weight: 600; color: #d32f2f;">${errorMessage}</span>
                </div>
                `
                    : ""
                }
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #ffcdd2; padding-top: 10px; margin-top: 10px;">
                  <span style="color: #666; font-size: 18px;">Status:</span>
                  <span style="font-weight: 700; color: #d32f2f; font-size: 18px;">FAILED</span>
                </div>
              </div>

              <!-- Order Items -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📦</span>
                  Order Items (Payment Pending)
                </h3>
                <div style="background-color: #fafafa; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; opacity: 0.8;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f5f5f5;">
                        <th style="padding: 15px; text-align: left; color: #666; font-weight: 600;">Image</th>
                        <th style="padding: 15px; text-align: left; color: #666; font-weight: 600;">Details</th>
                        <th style="padding: 15px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                        <th style="padding: 15px; text-align: right; color: #666; font-weight: 600;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Retry Instructions -->
              <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8f1 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
                <h3 style="margin-top: 0; color: #2e7d32; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">🔄</span>
                  What You Can Do
                </h3>
                <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Check your card details and try again</li>
                  <li>Ensure you have sufficient balance in your account</li>
                  <li>Try using a different payment method</li>
                  <li>Contact your bank if the issue persists</li>
                  <li>Reach out to our support team for assistance</li>
                </ul>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="#" style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); transition: all 0.3s ease;">
                  🔄 Try Payment Again
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #666; margin: 0;">Need help? Contact our support team at <a href="mailto:photoframix@gmail.com" style="color: #ec4899; text-decoration: none;">photoframix@gmail.com</a></p>
                <p style="color: #666; margin: 5px 0 0 0;">
                  Best regards,<br>
                  <strong style="color: #333;">The PhotoFramix Team</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment failure email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send payment failure email:", error);
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

  async sendContactInquiryThankYouEmail(email: string, firstName: string, ticketNumber: string) {
    try {
      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `Thank you for contacting us (Ticket #${ticketNumber})`,
        html: `
          <div style="background: #f6f8fa; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden;">
              <div style="background: linear-gradient(90deg, #10b981 0%, #2563eb 100%); padding: 32px 0; text-align: center;">
                <h1 style="color: #fff; font-size: 2rem; margin: 0;">Thank You for Contacting Us!</h1>
              </div>
              <div style="padding: 32px 24px;">
                <p style="font-size: 1.1rem; color: #222; margin-bottom: 18px;">
                  Hi <strong style="color: #2563eb;">${firstName}</strong>,
                </p>
                <p style="font-size: 1rem; color: #444; margin-bottom: 18px;">
                  We’ve received your inquiry and our team will reach out to you as soon as possible.
                </p>
                <div style="background: #f1f5f9; border-radius: 8px; padding: 18px 0; text-align: center; margin-bottom: 24px;">
                  <span style="color: #64748b; font-size: 0.95rem;">Your Ticket Number</span>
                  <div style="font-size: 1.3rem; font-weight: 600; color: #10b981; margin-top: 4px; letter-spacing: 1px;">
                    ${ticketNumber}
                  </div>
                </div>
                <p style="font-size: 1rem; color: #444; margin-bottom: 0;">
                  If you have any additional information or questions, just reply to this email.
                </p>
                <p style="font-size: 1rem; color: #444; margin-top: 24px;">
                  Best regards,<br>
                  <span style="color: #2563eb; font-weight: 500;">The PhotoFramix Team</span>
                </p>
              </div>
              <div style="background: #f1f5f9; text-align: center; padding: 16px; font-size: 0.95rem; color: #64748b;">
                © ${new Date().getFullYear()} PhotoFramix. All rights reserved.
              </div>
            </div>
          </div>
        `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send contact inquiry thank-you email:", error);
    }
  }

  async sendNewsletterThankYouEmail(email: string) {
    try {
      const mailOptions = {
        from: `${this.configService.get<string>("FROM_NAME")} <${this.configService.get<string>("FROM_EMAIL")}>`,
        to: email,
        subject: `Thank you for subscribing to our newsletter!`,
        html: `
          <div style="background: #f6f8fa; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden;">
              <div style="background: linear-gradient(90deg, #2563eb 0%, #10b981 100%); padding: 32px 0; text-align: center;">
                <h1 style="color: #fff; font-size: 2rem; margin: 0;">Welcome to Our Newsletter!</h1>
              </div>
              <div style="padding: 32px 24px;">
                <p style="font-size: 1.1rem; color: #222; margin-bottom: 18px;">
                  Thank you for subscribing to PhotoFramix updates.
                </p>
                <p style="font-size: 1rem; color: #444; margin-bottom: 18px;">
                  You'll be the first to know about our latest products, offers, and inspiration for your next frame!
                </p>
                <div style="background: #f1f5f9; border-radius: 8px; padding: 18px 0; text-align: center; margin-bottom: 24px;">
                  <span style="color: #64748b; font-size: 0.95rem;">Stay tuned for updates in your inbox.</span>
                </div>
                <p style="font-size: 1rem; color: #444; margin-bottom: 0;">
                  If you have any questions, just reply to this email.
                </p>
                <p style="font-size: 1rem; color: #444; margin-top: 24px;">
                  Best regards,<br>
                  <span style="color: #2563eb; font-weight: 500;">The PhotoFramix Team</span>
                </p>
              </div>
              <div style="background: #f1f5f9; text-align: center; padding: 16px; font-size: 0.95rem; color: #64748b;">
                © ${new Date().getFullYear()} PhotoFramix. All rights reserved.
              </div>
            </div>
          </div>
        `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send newsletter thank-you email:", error);
    }
  }
}
