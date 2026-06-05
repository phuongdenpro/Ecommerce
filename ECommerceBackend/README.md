# E-Commerce Backend API

ASP.NET Core 8 Web API theo **Clean Architecture**, dùng MySQL, JWT + Refresh Token, phù hợp tích hợp **Web Frontend** (React/Vue/Angular) và **Flutter Mobile**.

## Cấu trúc solution

```
ECommerceBackend/
├── ECommerce.sln
└── src/
    ├── ECommerce.API/           # Controllers, Middleware, Swagger, CORS
    ├── ECommerce.Application/   # DTOs, Services, Validators, AutoMapper
    ├── ECommerce.Domain/        # Entities, Enums, Interfaces, Exceptions
    ├── ECommerce.Infrastructure/# EF Core, JWT, File upload, Seed data
    └── ECommerce.Shared/        # ApiResponse, PagedResult, Helpers
```

## Yêu cầu

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [MySQL 8.x](https://dev.mysql.com/downloads/)
- (Tùy chọn) [EF Core CLI](https://learn.microsoft.com/ef/core/cli/dotnet): `dotnet tool install --global dotnet-ef`

## Cấu hình MySQL

1. Tạo database (hoặc để app tự migrate):

```sql
CREATE DATABASE ECommerceDb_Dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Sửa connection string trong `src/ECommerce.API/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=ECommerceDb_Dev;User=root;Password=YOUR_PASSWORD;"
}
```

3. Sửa `Jwt:Secret` trong `appsettings.json` (tối thiểu 32 ký tự) trước khi deploy production.

## Migration database

Từ thư mục gốc solution:

```bash
dotnet ef database update --project src/ECommerce.Infrastructure --startup-project src/ECommerce.API
```

Tạo migration mới (khi đổi entity):

```bash
dotnet ef migrations add TenMigration --project src/ECommerce.Infrastructure --startup-project src/ECommerce.API --output-dir Persistence/Migrations
```

## Chạy project

```bash
cd src/ECommerce.API
dotnet run
```

Hoặc từ root:

```bash
dotnet run --project src/ECommerce.API
```

- Swagger UI: `https://localhost:7073/swagger` hoặc `http://localhost:5207/swagger`
- API base: `https://localhost:7073/api`

## Tài khoản seed (lần chạy đầu)

| Email | Password | Role |
|-------|----------|------|
| admin@ecommerce.com | Admin@123 | Admin |

Dữ liệu mẫu: categories, brands, products, coupon `WELCOME10`.

## CORS (Web + Flutter)

Cấu hình origin trong `appsettings.json` → `Cors:AllowedOrigins`. Mặc định cho phép `localhost:3000`, `5173`, `4200`.

Flutter (Android emulator): thêm `http://10.0.2.2:5207` nếu gọi API host machine.

## Format response

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "errors": null
}
```

Phân trang (`data`):

```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 10,
  "totalItems": 100,
  "totalPages": 10
}
```

## API endpoints chính

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register`, `login`, `refresh-token`, `logout`, `change-password`, `forgot-password`, `reset-password` |
| User | `GET/PUT /api/users/profile` |
| Products | `GET/POST/PUT/DELETE /api/products`, upload ảnh qua `multipart/form-data` |
| Categories | `GET/POST/PUT/DELETE /api/categories` |
| Brands | `GET/POST/PUT/DELETE /api/brands` |
| Cart | `GET /api/cart`, `POST/PUT/DELETE /api/cart/items` |
| Orders | `POST /api/orders`, `GET /api/orders/my-orders`, admin `GET/PUT /api/orders` |
| Payments | `POST /api/payments/process` (COD, BankTransfer, OnlinePayment mock) |
| Reviews | `GET/POST/PUT/DELETE /api/reviews`, admin hide |
| Wishlist | `GET/POST/DELETE /api/wishlist/{productId}` |
| Addresses | CRUD `/api/addresses`, set default |
| Coupons | `POST /api/coupons/validate`, admin CRUD |
| Admin | `GET /api/admin/dashboard`, revenue, top products, recent orders |

Gửi JWT: header `Authorization: Bearer {accessToken}`.

## Upload ảnh sản phẩm

`POST /api/products` với `Content-Type: multipart/form-data`, fields JSON + `images` (nhiều file). File lưu tại `wwwroot/uploads/products/`.

## Payment gateway (mở rộng)

`PaymentService` mock COD / chuyển khoản / online. Thay `ProcessOnlinePaymentAsync` để tích hợp VNPay, Momo, Stripe.

## Roles

- **Admin**: toàn quyền, dashboard, coupons
- **Staff**: quản lý sản phẩm, đơn hàng
- **Customer**: mua hàng, giỏ hàng, review

## Ghi chú

- Project cũ `ECommerceBackend.csproj` ở root là template mặc định; dùng **`ECommerce.sln`** và **`src/ECommerce.API`**.
- Global exception middleware + FluentValidation.
- Soft delete: Product, Category.

## License

MIT (tùy chỉnh cho portfolio/CV).
