# PayU Callback Debugging Guide

## Issue
The PayU callback controller is not being called on payment success or failure.

## Root Cause Analysis
The problem was that the PayU callback URLs (surl/furl) were pointing to frontend HTML pages instead of the backend API endpoints.

## Solution Implemented

### 1. Updated PayU Callback URLs
**Before:**
```javascript
surl: window.location.origin + '/payment-success.html'
furl: window.location.origin + '/payment-failure.html'
```

**After:**
```javascript
surl: http://localhost:3000/api/payments/payu/callback
furl: http://localhost:3000/api/payments/payu/callback
```

### 2. Enhanced PayU Controller
- Added both POST and GET endpoints for PayU callback
- Added proper form data handling
- Added redirect logic to frontend pages
- Added comprehensive error handling

### 3. Added Debugging
Added extensive logging to track the payment flow:

#### PayU Initiation Debugging:
```typescript
console.log("PayU callback URLs:");
console.log("Success URL (surl):", surl);
console.log("Failure URL (furl):", furl);
console.log("PayU payment parameters:");
console.log(JSON.stringify(paymentParams, null, 2));
```

#### PayU Callback Debugging:
```typescript
console.log("=== PayU Callback Debug ===");
console.log("Callback body received:", JSON.stringify(body, null, 2));
console.log("Transaction ID:", body.txnid);
console.log("Status:", body.status);
console.log("Hash validation result:", isValid);
```

## Testing Steps

### 1. Check PayU URLs
When initiating payment, verify in logs:
- surl points to: `http://localhost:3000/api/payments/payu/callback`
- furl points to: `http://localhost:3000/api/payments/payu/callback`

### 2. Monitor Callback Logs
When PayU redirects back, check for:
```
=== PayU Callback Debug ===
Callback body received: {...}
Transaction ID: [txnid]
Status: [success/failure]
Hash validation result: [true/false]
```

### 3. Verify Order Lookup
Check logs for:
```
Looking for order with txnid: [txnid]
Order found: [Yes/No]
```

### 4. Confirm Email Sending
Look for:
```
Payment successful - updating order status
Order status updated, sending success email
Payment success email sent to [email]
```

## Common Issues & Solutions

### Issue 1: Callback Not Triggered
**Symptoms:** No callback logs appear
**Solution:** Ensure PayU URLs point to API endpoints, not frontend pages

### Issue 2: Order Not Found
**Symptoms:** "Order not found" in logs
**Solution:** Verify txnid is being stored correctly during order creation

### Issue 3: Hash Validation Fails
**Symptoms:** Hash validation returns false
**Solution:** Check PayU key and salt configuration

### Issue 4: Email Not Sent
**Symptoms:** Payment processed but no email
**Solution:** Check SMTP configuration and notification service

## Configuration Required

Add to your `.env` file:
```
BASE_URL=http://localhost:3000
PAYU_API_KEY=your_payu_key
PAYU_SALT=your_payu_salt
```

## Files Modified

1. `src/payments/payments.controller.ts` - Enhanced callback handling
2. `src/payments/payments.service.ts` - Fixed callback URLs and added debugging
3. `src/orders/orders.service.ts` - Added debugging to order lookup
4. `public/payu-payment-test.html` - Removed frontend URL parameters

## Test Flow

1. **Start Payment:** Use test form at `/payu-payment-test.html`
2. **PayU Redirect:** PayU will redirect to `/api/payments/payu/callback`
3. **Callback Processing:** Backend processes payment and sends email
4. **Frontend Redirect:** User redirected to success/failure page
5. **Email Notification:** User receives payment status email

## Expected Log Output

**Successful Payment:**
```
PayU callback URLs:
Success URL (surl): http://localhost:3000/api/payments/payu/callback
=== PayU Callback Debug ===
Status: success
Hash validation result: true
Payment successful - updating order status
Payment success email sent to user@example.com
```

**Failed Payment:**
```
=== PayU Callback Debug ===
Status: failure
Hash validation result: true
Payment failed or invalid - updating order status
Payment failure email sent to user@example.com
```
