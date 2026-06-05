# ShopVN — E-Commerce Frontend (Next.js)

Frontend Next.js 15 kết nối **E-Commerce Backend ASP.NET Core 8**, gồm cửa hàng khách hàng và trang quản trị admin.

## Yêu cầu

- Node.js 18+
- npm
- Backend API đang chạy (xem `../ECommerceBackend/README.md`)

## Cài đặt

```bash
cd ecommerce-frontend
npm install
```

## Cấu hình `.env.local`

Sao chép file mẫu và chỉnh URL API:

```bash
cp .env.local.example .env.local
```

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | URL gốc backend, **không** có `/api` (vd: `http://localhost:5207` hoặc `https://localhost:7073`) |

## Chạy project

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Build production:

```bash
npm run build
npm start
```

## Kết nối backend ASP.NET

1. Chạy backend từ `ECommerceBackend`:

   ```bash
   dotnet run --project src/ECommerce.API
   ```

2. Đảm bảo CORS cho phép `http://localhost:3000` trong `appsettings.json` → `Cors:AllowedOrigins`.

3. Đặt `NEXT_PUBLIC_API_BASE_URL` trùng với URL Swagger (không có `/api`).

4. Ảnh sản phẩm được phục vụ từ `wwwroot/uploads` — frontend ghép URL qua helper `resolveMediaUrl()`.

## Tài khoản admin mẫu

| Email | Mật khẩu | Role |
|-------|-----------|------|
| admin@ecommerce.com | Admin@123 | Admin |

Mã giảm giá seed: `WELCOME10`

## Danh sách chức năng

### Khách hàng (Customer)

- Trang chủ, danh sách & chi tiết sản phẩm, tìm kiếm/lọc
- Giỏ hàng, thanh toán (COD / chuyển khoản / online mock)
- Đơn hàng, hủy đơn (Pending)
- Yêu thích (wishlist)
- Tài khoản, đổi mật khẩu
- Đăng ký / đăng nhập

### Quản trị (Admin / Staff)

- **Dashboard** (`/admin`): 15+ thẻ KPI, biểu đồ Recharts (doanh thu, đơn, đăng ký, pie chart), quick actions, bảng top SP / đơn / khách / tồn kho / review
- **Khách hàng** (`/admin/customers`): danh sách, lọc, khóa/mở, chi tiết + đơn + địa chỉ
- **Người dùng** (`/admin/users`): toàn bộ role, đổi role (Admin)
- **Đơn hàng**: lọc nâng cao, chi tiết, in hóa đơn, hủy admin, export CSV
- **Tạo đơn** (`/admin/orders/create`): UI stepper — chờ `POST /api/admin/orders` (xem `docs/MISSING_BACKEND_APIS.md`)
- **Sản phẩm**: tìm kiếm, lọc category/brand/status, sắp hết hàng, preview shop
- Danh mục, thương hiệu, mã giảm giá
- **Đánh giá**, **Thanh toán**, **Báo cáo**, **Cài đặt** (settings chờ API)

### Bảo mật frontend

- Không hard-code API URL (`NEXT_PUBLIC_API_BASE_URL`)
- JWT + refresh token trong `localStorage`, cookie role cho middleware
- Route guard: middleware chặn `/admin` với role Admin/Staff
- Customer không vào được `/admin`
- Axios interceptor: 401 → refresh token → retry; refresh fail → logout

### UI/UX

- Giao diện responsive, clean/modern
- Loading skeleton, empty state, error state
- Toast (Sonner), modal xác nhận xóa
- Form validation (Zod + React Hook Form)

## Helper unwrap API `data`

```typescript
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

// Response chuẩn: { success, message, data, errors }
const user = unwrapData(response);

// Phân trang trong data:
// { items, pageNumber, pageSize, totalItems, totalPages }
const page = unwrapPagedData(response);
```

## Cấu trúc thư mục

```
ecommerce-frontend/
├── public/
│   └── placeholder-product.svg
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, register
│   │   ├── (shop)/          # cửa hàng khách
│   │   └── admin/           # dashboard admin
│   ├── features/admin/        # components + services admin
│   ├── components/
│   │   ├── admin/             # product-form
│   │   ├── layout/            # admin-sidebar, admin-header
│   │   ├── shop/
│   │   └── ui/
│   ├── docs/
│   │   └── MISSING_BACKEND_APIS.md
│   ├── lib/
│   │   ├── api/             # client axios + API modules
│   │   ├── api-response.ts  # unwrapData, unwrapPagedData
│   │   ├── api-error.ts
│   │   ├── auth-storage.ts
│   │   └── utils.ts
│   ├── store/               # zustand (auth, cart)
│   ├── types/
│   └── middleware.ts        # route guard theo role
├── .env.local.example
└── README.md
```

## License

MIT
