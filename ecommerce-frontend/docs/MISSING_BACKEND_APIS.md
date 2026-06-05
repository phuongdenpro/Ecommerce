# Missing Backend APIs

Tài liệu này chỉ liệt kê các API **chưa có** hoặc **chưa đủ** so với frontend Admin.

Các API đã triển khai — xem Swagger hoặc mục **Đã bổ sung** bên dưới.

---

## Đã bổ sung (đợt nâng cấp Admin)

### Dashboard & tổng quan
- `GET /api/admin/dashboard`, `GET .../extended`, `GET .../revenue`, `GET .../top-products`, `GET .../recent-orders`
- `GET /api/admin/dashboard/low-stock`, `GET .../recent-customers`
- Quyền: `Admin`, `Staff` (`AdminOrStaff`)

### Users / Customers
- `GET /api/admin/users`, `GET /api/admin/users/{id}`
- `POST /api/admin/users` — tạo user (Customer/Staff/Admin theo `role`)
- `PUT /api/admin/users/{id}` — cập nhật profile
- `PUT /api/admin/users/{id}/status`, `PUT .../role` (role: Admin only)
- `GET /api/admin/users/{id}/wishlist`
- `GET /api/admin/users/{id}/notes`, `PUT .../notes`
- `GET /api/admin/users/{id}/reviews`

### Orders
- `GET /api/orders` (admin query: status, payment, date, search)
- `GET /api/orders/{id}` (Admin/Staff)
- `POST /api/orders/{id}/admin-cancel`
- `POST /api/admin/orders` — tạo đơn cho khách
- `PUT /api/admin/orders/{id}/payment-status`

### Reviews
- `GET /api/admin/reviews`, `PUT .../hide`, `PUT .../unhide`, `DELETE ...`

### Payments
- `GET /api/admin/payments`
- `PUT /api/admin/payments/{id}/status`

### Coupons
- `GET /api/coupons`, `POST /api/coupons`
- `PUT /api/coupons/{id}`, `DELETE /api/coupons/{id}` (xóa hoặc deactivate nếu đã dùng)

### Reports
- `GET /api/admin/reports/revenue?from=&to=`
- `GET /api/admin/reports/orders?from=&to=`
- `GET /api/admin/reports/customers?from=&to=`
- `GET /api/admin/reports/export?type=revenue|orders|customers&format=csv`

### Store settings
- `GET /api/admin/settings`, `PUT /api/admin/settings` (Admin only)
- Bảng `StoreSettings` (singleton row)

### Database
- Migration: `20260604180000_AddStoreSettingsAndAdminNotes` (`Users.AdminNotes`, `StoreSettings`)

---

## Chưa có / có thể mở rộng sau

Hiện **không còn** API bắt buộc cho các màn Admin đã dựng trên frontend. Các hạng mục sau là tùy chọn:

| Hạng mục | Ghi chú |
|----------|---------|
| Upload logo settings | Frontend có thể dùng URL tĩnh; chưa có `POST /api/admin/settings/logo` |
| Export PDF/Excel | Chỉ hỗ trợ CSV qua `reports/export` |
| Refund workflow | `PaymentStatus.Refunded` có enum; chưa có luồng hoàn tiền gateway |
| Phân quyền chi tiết | Chỉ dùng role `Admin` / `Staff` / `Customer` |

---

## Lệnh sau khi pull code

```bash
# Dừng API đang chạy (nếu build báo file lock), rồi:
cd ECommerceBackend
dotnet build ECommerce.sln
dotnet ef database update --project src/ECommerce.Infrastructure --startup-project src/ECommerce.API
dotnet run --project src/ECommerce.API
```

Migration mới: `AddStoreSettingsAndAdminNotes`.
