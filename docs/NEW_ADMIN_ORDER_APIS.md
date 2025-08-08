# New Admin APIs for Orders Module

## Overview
Added three new admin-only APIs to enhance order management capabilities for administrators. **All status updates now automatically send email notifications to customers.**

## 1. Bulk Update Orders API

**Endpoint:** `PUT /orders/bulk-update`
**Access:** Admin only
**Purpose:** Update multiple orders at once with the same values

### Request Body (BulkUpdateOrderDto)
```json
{
  "orderIds": ["orderId1", "orderId2", "orderId3"],
  "status": "shipped",           // Optional: New status for all orders
  "paymentStatus": "paid",       // Optional: New payment status for all orders
  "trackingNumber": "TRACK123",  // Optional: Tracking number for all orders
  "notes": "Bulk shipped"        // Optional: Notes for status history
}
```

### Response
```json
{
  "updated": 2,
  "failed": ["orderId3: Order not found"]
}
```

**📧 Email Notification:** When status is updated, each customer receives an email notification about their order status change.

## 2. Single Order Update API

**Endpoint:** `PUT /orders/:id`
**Access:** Admin only
**Purpose:** Update any order details including address, email, items, etc.

### Request Body (UpdateOrderDto)
```json
{
  "status": "processing",
  "paymentStatus": "paid",
  "totalAmount": 150.00,
  "shippingCost": 15.00,
  "taxAmount": 12.00,
  "paymentId": "pay_123",
  "paymentMethod": "credit_card",
  "trackingNumber": "TRACK456",
  "estimatedDelivery": "2025-07-15T00:00:00.000Z",
  "notes": "Special handling required",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "items": [
    {
      "productId": "prod123",
      "quantity": 2,
      "price": 50.00,
      "size": "12x16",
      "frameType": "wood",
      "imageUrl": "https://example.com/image.jpg",
      "notes": "Custom frame"
    }
  ],
  "statusNotes": "Updated by admin"
}
```

**Note:** All fields are optional. Only provide the fields you want to update.

### Response
Returns the updated order object with all changes applied.

**📧 Email Notification:** When status is updated, the customer receives an email notification about the order status change.

## 3. Original Status Update API (Enhanced)

**Endpoint:** `PATCH /orders/:id/status`
**Access:** Admin only
**Purpose:** Update order status (already had email notifications)

**📧 Email Notification:** Customer receives email notification when status is updated.

## 3. Advanced Order Search API

**Endpoint:** `GET /orders/admin/search`
**Access:** Admin only
**Purpose:** Search orders with multiple filters and criteria

### Query Parameters (SearchOrderDto)
- `page` (number): Page number for pagination
- `limit` (number): Number of results per page
- `orderNumber` (string): Search by order number (partial match)
- `customerEmail` (string): Search by customer email (partial match)
- `customerName` (string): Search by first or last name (partial match)
- `customerPhone` (string): Search by phone number (partial match)
- `status` (enum): Filter by order status
- `paymentStatus` (enum): Filter by payment status
- `fromDate` (string): Start date for date range (YYYY-MM-DD)
- `toDate` (string): End date for date range (YYYY-MM-DD)
- `trackingNumber` (string): Search by tracking number (partial match)
- `minAmount` (number): Minimum order amount
- `maxAmount` (number): Maximum order amount

### Example Request
```
GET /orders/admin/search?customerEmail=john&status=pending&fromDate=2025-07-01&toDate=2025-07-10&page=1&limit=10
```

### Response
```json
{
  "orders": [
    {
      "_id": "orderObjectId",
      "orderNumber": "FR20250709001",
      "status": "pending",
      "paymentStatus": "pending",
      "totalAmount": 150.00,
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        // ... other address fields
      },
      "items": [...],
      "createdAt": "2025-07-09T10:00:00.000Z",
      // ... other order fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Status Enums
### OrderStatus
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`
- `failed`

### PaymentStatus
- `pending`
- `paid`
- `failed`
- `refunded`

## Security
All three APIs require:
1. JWT authentication (`@UseGuards(JwtAuthGuard)`)
2. Admin role (`@UseGuards(RolesGuard)` + `@Roles(UserRole.ADMIN)`)
3. Bearer token in Authorization header

## Error Handling
All APIs include proper error handling with appropriate HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (order not found)
- 500: Internal Server Error

## Features
- **Bulk Operations**: Efficiently update multiple orders
- **Flexible Updates**: Update any order field including nested objects
- **Advanced Search**: Multiple search criteria with pagination
- **Status History**: Automatic tracking of status changes
- **Partial Matching**: Search with partial text matches
- **Date Range Filtering**: Filter orders by date ranges
- **Amount Range Filtering**: Filter orders by total amount ranges

## Email Notifications 📧

### Beautiful Email Templates
All admin APIs that change order status will automatically send **beautifully designed, professional email notifications** to customers featuring:

#### 🎨 Modern Design Features:
- **Gradient header** with YashTiles branding
- **Status-specific colors and icons** (✅ Confirmed, 🔨 Processing, 🚚 Shipped, 🎉 Delivered)
- **Interactive progress bar** showing order completion percentage
- **Responsive design** that looks great on all devices
- **Professional typography** with modern fonts

#### 📋 Comprehensive Content:
- **Personalized greeting** with customer's name
- **Status-specific messaging** with encouraging language
- **Complete order details** including order number, date, and total
- **Item showcase** with product images and details
- **Tracking information** (when available)
- **Estimated delivery dates** (when available)
- **Customer support contact** information

#### 📱 Email Template Sections:
1. **Header**: Branded gradient header with YashTiles logo
2. **Greeting**: Personalized welcome message
3. **Status Card**: Color-coded status update with icon and message
4. **Progress Bar**: Visual progress indicator
5. **Order Details**: Complete order information in an organized card
6. **Items Display**: Product showcase with images and descriptions
7. **Call-to-Action**: Track package button (for shipped orders)
8. **Support Section**: Help and contact information
9. **Footer**: Social links, branding, and legal information

### Automatic Customer Notifications
1. **Bulk Update API** - When `status` field is updated for multiple orders
2. **Single Order Update API** - When `status` field is updated  
3. **Original Status Update API** - Already implemented

### Enhanced Status Messages:
- **CONFIRMED**: "Your order has been confirmed and is being prepared with care." ✅
- **PROCESSING**: "Your custom frames are being crafted by our skilled artisans." 🔨
- **SHIPPED**: "Exciting news! Your beautiful frames are on their way to you." 🚚
- **DELIVERED**: "Your frames have arrived! We hope you love them." 🎉
- **CANCELLED**: "Your order has been cancelled. If you have any questions, please contact us." ❌

### Progress Tracking:
- **Pending**: 20% progress
- **Confirmed**: 40% progress  
- **Processing**: 60% progress
- **Shipped**: 80% progress
- **Delivered**: 100% progress

### Error Handling for Email:
- Email failures are logged but don't cause the order update to fail
- This ensures order updates succeed even if email service is temporarily unavailable
- Admin can see email failures in the logs for troubleshooting

### Mobile Optimization:
- **Responsive design** works perfectly on mobile devices
- **Touch-friendly** buttons and links
- **Optimized images** for fast loading
- **Clean layout** that's easy to read on small screens
