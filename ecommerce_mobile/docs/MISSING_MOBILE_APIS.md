# Missing / Recommended APIs for Mobile App

Các API backend hiện có đã đủ cho flow mua hàng cơ bản. Dưới đây là các API **chưa có** hoặc **chỉ dành admin** mà mobile cần để hoàn thiện trải nghiệm.

---

## 1. Public Store Settings (Bank Transfer Info)

**Trạng thái:** Chưa có public endpoint. `StoreSettings` chỉ có API admin (`PUT /api/admin/settings`).

**Đề xuất:**

| | |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/store/settings` hoặc `/api/settings/public` |
| **Auth** | Không cần (hoặc Bearer optional) |

**Response `data` đề xuất:**

```json
{
  "storeName": "ShopVN",
  "defaultShippingFee": 30000,
  "freeShippingThreshold": 500000,
  "enableCod": true,
  "enableBankTransfer": true,
  "enableOnlinePayment": true,
  "bankName": "Vietcombank",
  "bankAccountNumber": "0123456789",
  "bankAccountName": "SHOPVN STORE",
  "bankQrImageUrl": "https://..."
}
```

**Ghi chú:** Mobile hiện dùng config cục bộ trong `lib/core/constants/payment_constants.dart`.

---

## 2. Bank Account Fields in StoreSettings Entity

**Trạng thái:** Entity `StoreSettings` chưa có `BankName`, `BankAccountNumber`, `BankAccountName`, `BankQrImageUrl`.

**Đề xuất:** Bổ sung field vào domain + migration, sau đó expose qua API public ở mục 1.

---

## 3. Customer Confirm Bank Transfer Payment

**Trạng thái:** Không có API cho customer tự báo "đã chuyển khoản". Admin có `PUT /api/admin/payments/{id}/status`.

**Đề xuất:**

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/payments/order/{orderId}/confirm-transfer` |
| **Auth** | Bearer (Customer) |

**Request body (optional):**

```json
{
  "transactionReference": "FT123456",
  "note": "Đã chuyển khoản"
}
```

**Response `data`:** `PaymentDto` (status vẫn `Pending` cho admin duyệt, hoặc `Paid` nếu auto-confirm).

---

## 4. Real Online Payment Gateway

**Trạng thái:** `POST /api/payments/process` với `method: 2` (OnlinePayment) là **mock** — tự động `Paid`.

**Đề xuất khi tích hợp VNPay/Momo/Stripe:**

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/payments/online/create` |
| **Auth** | Bearer |

**Request:**

```json
{
  "orderId": "guid",
  "returnUrl": "myapp://payment-result",
  "cancelUrl": "myapp://payment-cancel"
}
```

**Response:**

```json
{
  "paymentUrl": "https://payment-gateway.com/...",
  "transactionId": "TXN-xxx"
}
```

---

## 5. Clear Cart Endpoint

**Trạng thái:** Không có `DELETE /api/cart`. Cart được xóa khi tạo đơn hàng thành công.

**Đề xuất (optional):**

| | |
|---|---|
| **Method** | `DELETE` |
| **Endpoint** | `/api/cart` |
| **Auth** | Bearer |

Mobile hiện xóa từng item hoặc rely on order creation clearing cart.

---

## APIs đã dùng trên mobile

| Feature | Endpoint |
|---------|----------|
| Products list | `GET /api/products?pageNumber=&pageSize=` |
| Product detail | `GET /api/products/{id}` |
| Cart | `GET/POST/PUT/DELETE /api/cart`, `/api/cart/items` |
| Create order | `POST /api/orders` |
| My orders | `GET /api/orders/my-orders` |
| Order detail | `GET /api/orders/my-orders/{id}` |
| Cancel order | `POST /api/orders/{id}/cancel` |
| Process payment | `POST /api/payments/process` |
| Payment by order | `GET /api/payments/order/{orderId}` |
