import Link from "next/link";

export function ShopFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-bold text-white">ShopVN</p>
          <p className="mt-2 text-sm text-slate-400">
            Cửa hàng trực tuyến hiện đại — giao diện demo kết nối ASP.NET Core API.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Mua sắm</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/products" className="hover:text-white">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Tài khoản</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/login" className="hover:text-white">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                Đăng ký
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white">
                Đơn hàng
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Hỗ trợ</p>
          <p className="mt-3 text-sm text-slate-400">hotline@shopvn.demo</p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ShopVN E-Commerce
      </div>
    </footer>
  );
}
