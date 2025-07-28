# Framely Backend API

A comprehensive NestJS backend application for Framely - a custom photo frame ordering platform.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with secure refresh token strategy
- **HTTP-only cookies** for refresh token storage (more secure than localStorage)
- **Password reset & forgot password** functionality
- **Role-based access control** (Admin, Customer, Guest)
- **Email verification** system

### Payment Integration
- **Stripe** payment processing
- **Razorpay** payment processing
- **Webhook handling** for payment status updates
- **Payment verification** and order status synchronization

### Order Management System
- **Complete order lifecycle** management
- **Order status tracking** (Pending → Confirmed → Processing → Shipped → Delivered)
- **Automatic order number generation**
- **Order history** and status updates
- **Shipping address** management

### Content Management System (CMS)
- **Product management** with categories, pricing, and specifications
- **Image upload** with Cloudinary integration
- **Order status management** for admins
- **User management** system
- **Admin dashboard** with analytics

### Notification System
- **Email notifications** for:
  - Welcome emails
  - Order confirmations
  - Order status updates
  - Password reset
- **WhatsApp notifications** via Twilio for:
  - Order confirmations
  - Delivery status updates

### File Upload & Management
- **Cloudinary integration** for image storage
- **Image optimization** and transformation
- **Multiple file upload** support
- **Secure file deletion**

## 🛠 Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport
- **Payment**: Stripe & Razorpay
- **Email**: Nodemailer
- **SMS/WhatsApp**: Twilio
- **File Storage**: Cloudinary
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator & Class Transformer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd framely-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`:

### Database
```env
MONGODB_URI=mongodb://localhost:27017/framely
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Email Configuration (Gmail example)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@photoframix.com
FROM_NAME=PhotoFramix
```

### Payment Gateways
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Twilio (WhatsApp)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Cloudinary
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Documentation**: http://localhost:3000/api/docs

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI. Once the server is running, visit:
```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

#### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders (paginated)
- `GET /api/v1/orders/:id` - Get specific order
- `PATCH /api/v1/orders/:id/status` - Update order status (Admin only)

#### Products
- `GET /api/v1/products` - Get all products (with filters)
- `POST /api/v1/products` - Create product (Admin only)
- `PATCH /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

#### Payments
- `POST /api/v1/payments/stripe/create-intent` - Create Stripe payment
- `POST /api/v1/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/v1/payments/stripe/verify` - Verify Stripe payment
- `POST /api/v1/payments/razorpay/verify` - Verify Razorpay payment

#### File Uploads
- `POST /api/v1/uploads/image` - Upload single image
- `POST /api/v1/uploads/images` - Upload multiple images
- `DELETE /api/v1/uploads/image/:publicId` - Delete image

#### Admin
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/dashboard/activity` - Recent activity
- `GET /api/v1/admin/dashboard/order-distribution` - Order status distribution

## 👥 User Roles

### 1. Customer
- View and manage their own orders
- Upload images for frames
- Make payments
- Update profile information

### 2. Admin
- Full access to CMS system
- Manage all orders and their statuses
- Manage products and categories
- View analytics and reports
- Manage users

### 3. Guest (Public User)
- Browse products
- View product details
- No account required for browsing

## 🔐 Security Features

- **JWT Authentication** with short-lived access tokens
- **Refresh Token Rotation** for enhanced security
- **HTTP-only Cookies** for refresh token storage
- **Rate Limiting** to prevent abuse
- **Input Validation** using class-validator
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **Password Hashing** using bcrypt

## 📧 Email Templates

The system includes professional email templates for:
- Welcome emails for new users
- Order confirmation with detailed order information
- Order status updates with tracking information
- Password reset with secure links
- Password change confirmations

## 📱 WhatsApp Integration

Automated WhatsApp notifications via Twilio:
- Order confirmation messages
- Delivery status updates
- Professional message formatting

## 🗄️ Database Schema

### Users Collection
- Authentication information
- Profile data
- Role-based permissions
- Address information

### Orders Collection
- Complete order details
- Item specifications (size, frame type, images)
- Shipping information
- Payment status
- Status history tracking

### Products Collection
- Product information and specifications
- Pricing for different sizes
- Available frame types
- Image galleries
- Category organization

## 🔄 Order Workflow

1. **Order Creation** - Customer places order with items and shipping info
2. **Payment Processing** - Integration with Stripe/Razorpay
3. **Order Confirmation** - Email and WhatsApp notifications sent
4. **Status Updates** - Admin updates order status through CMS
5. **Notifications** - Automatic notifications for each status change
6. **Delivery Tracking** - Tracking numbers and estimated delivery dates

## 🛡️ Error Handling

- Comprehensive error handling with proper HTTP status codes
- Validation errors with detailed field-level messages
- Payment processing error handling
- File upload error management
- Database connection error handling

## 📊 Monitoring & Logging

- Request/response logging
- Error tracking and reporting
- Performance monitoring
- Payment transaction logging

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Environment Variables for Production
Ensure all environment variables are properly set for production:
- Use strong JWT secrets
- Configure production database
- Set up production email service
- Configure production payment keys
- Set up production file storage

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the environment configuration

---

**Framely Backend** - Built with ❤️ using NestJS