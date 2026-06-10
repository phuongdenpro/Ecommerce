# Missing or Required Backend APIs for Flutter E-commerce App

This document outlines the backend API endpoints required for the Flutter mobile app to function correctly. If your backend doesn't have these endpoints yet, please implement them.

## 1. Order Management APIs

### 1.1 Get User Orders (with Pagination)
- **Method**: GET
- **Endpoint**: `/api/orders/my-orders`
- **Query Parameters**: 
  - `page` (int, required): Current page number (1-based)
  - `pageSize` (int, required): Number of items per page
- **Headers**: `Authorization: Bearer {token}`
- **Response Format**:
  ```json
  [
    {
      "id": 1,
      "orderCode": "DH-2026-001",
      "totalAmount": 890000,
      "status": "pending|confirmed|shipping|completed|cancelled",
      "paymentMethod": "COD|BankTransfer",
      "paymentStatus": "Paid|Unpaid|Pending",
      "shippingAddress": "123 Nguyen Hue, HCMC",
      "recipientName": "John Doe",
      "recipientPhone": "0123456789",
      "notes": "Please deliver in the morning",
      "createdAt": "2026-06-10T10:30:00Z",
      "updatedAt": "2026-06-10T10:30:00Z",
      "items": [
        {
          "productId": 1,
          "productName": "Product Name",
          "price": 100000,
          "quantity": 2,
          "imageUrl": "https://..."
        }
      ]
    }
  ]
  ```

### 1.2 Get Order Detail
- **Method**: GET
- **Endpoint**: `/api/orders/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Same as single order in list above, wrapped in `data` field:
  ```json
  {
    "data": { /* order object */ }
  }
  ```

### 1.3 Create Order
- **Method**: POST
- **Endpoint**: `/api/orders`
- **Headers**: `Authorization: Bearer {token}`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "recipientName": "John Doe",
    "recipientPhone": "0123456789",
    "shippingAddress": "123 Nguyen Hue, HCMC",
    "paymentMethod": "COD|BankTransfer",
    "notes": "Optional delivery notes"
  }
  ```
- **Response**: Order object with `id`, `orderCode`, etc.

### 1.4 Cancel Order
- **Method**: POST
- **Endpoint**: `/api/orders/{id}/cancel`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ "success": true, "message": "Order cancelled" }` or similar

### 1.5 Update Order Status (Admin/System Only)
- **Method**: PUT
- **Endpoint**: `/api/orders/{id}/status`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "status": "pending|confirmed|shipping|completed|cancelled"
  }
  ```
- **Response**: Updated order object

## 2. Cart APIs (Optional but Recommended)

### 2.1 Get User Cart
- **Method**: GET
- **Endpoint**: `/api/cart`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "data": {
      "id": 1,
      "items": [
        {
          "productId": 1,
          "productName": "Product",
          "price": 100000,
          "quantity": 2,
          "imageUrl": "https://..."
        }
      ],
      "totalAmount": 200000
    }
  }
  ```

### 2.2 Add Item to Cart
- **Method**: POST
- **Endpoint**: `/api/cart/items`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```
- **Response**: Added cart item object

### 2.3 Update Cart Item Quantity
- **Method**: PUT
- **Endpoint**: `/api/cart/items/{productId}`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response**: Updated cart item

### 2.4 Remove Item from Cart
- **Method**: DELETE
- **Endpoint**: `/api/cart/items/{productId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ "success": true }` or similar

### 2.5 Clear Cart
- **Method**: DELETE
- **Endpoint**: `/api/cart`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ "success": true }` or similar

## 3. Payment APIs (If Implementing Online Payment)

### 3.1 Create Payment Intent (For Stripe, Momo, etc.)
- **Method**: POST
- **Endpoint**: `/api/payments/create-intent`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "orderId": 1,
    "amount": 890000,
    "paymentMethod": "card|momo|paypal"
  }
  ```
- **Response**:
  ```json
  {
    "clientSecret": "...",
    "transactionId": "...",
    "paymentUrl": "https://..."
  }
  ```

### 3.2 Verify Payment
- **Method**: POST
- **Endpoint**: `/api/payments/verify`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "orderId": 1,
    "transactionId": "...",
    "status": "success|failed"
  }
  ```
- **Response**: Updated order with payment status

### 3.3 Get Bank Transfer Details
- **Method**: GET
- **Endpoint**: `/api/payments/bank-transfer-info`
- **Headers**: `Authorization: Bearer {token}` (optional)
- **Response**:
  ```json
  {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountHolder": "ABC Company",
    "branchName": "Ho Chi Minh",
    "qrCodeUrl": "https://..."
  }
  ```

## 4. Product APIs (Should Already Exist)

### 4.1 Get Products (with Pagination)
- **Method**: GET
- **Endpoint**: `/api/products`
- **Query Parameters**: `page`, `pageSize`
- **Response**: List of product objects

### 4.2 Get Product Detail
- **Method**: GET
- **Endpoint**: `/api/products/{id}`
- **Response**: Single product object with all details

## Response Format Standards

All API responses should follow this format:

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors if any */ }
}
```

### HTTP Status Codes:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No/invalid token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Order Status Enum Values

The app expects these exact status values from the backend:
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by store
- `shipping` - Order is being shipped
- `completed` - Order delivered
- `cancelled` - Order cancelled

## Payment Status Enum Values

- `Paid` - Payment received
- `Unpaid` - Payment not received (for COD)
- `Pending` - Payment processing

## Payment Method Enum Values

- `COD` - Cash On Delivery
- `BankTransfer` - Bank transfer
- `OnlinePayment` - Online payment (if implemented)

## Important Notes

1. **Authentication**: All user-specific endpoints require Bearer token in Authorization header
2. **Pagination**: Implement offset-based pagination for list endpoints
3. **Timestamps**: Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
4. **Validation**: Return 400 status with detailed error messages for validation failures
5. **Stock Validation**: When creating order, verify product quantities are available
6. **Cart Isolation**: Each user should have their own cart (authenticated)
7. **Order History**: Users should only see their own orders

## Testing the APIs

Use Postman or similar tool with Bearer token:
1. Login to get token
2. Test each endpoint with proper headers
3. Verify response format matches specification
4. Test edge cases (empty cart, invalid quantities, etc.)
