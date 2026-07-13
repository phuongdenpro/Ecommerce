import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export function ShopFooter() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-black">
                S
              </div>
              <p className="text-lg font-bold text-white">ShopVN</p>
            </div>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Mua sắm thông minh — hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.
            </p>

            {/* Social links */}
            <div className="mt-5 flex gap-3">
              {[
                {
                  href: "#",
                  label: "Facebook",
                  svg: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  ),
                },
                {
                  href: "#",
                  label: "Instagram",
                  svg: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  ),
                },
                {
                  href: "#",
                  label: "YouTube",
                  svg: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ),
                },
              ].map(({ href, label, svg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Mua sắm</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/products", label: "Tất cả sản phẩm" },
                { href: "/products?isFeatured=true", label: "Sản phẩm nổi bật" },
                { href: "/cart", label: "Giỏ hàng" },
                { href: "/checkout", label: "Thanh toán" },
                { href: "/wishlist", label: "Yêu thích" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Tài khoản</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/login", label: "Đăng nhập" },
                { href: "/register", label: "Đăng ký" },
                { href: "/account", label: "Hồ sơ" },
                { href: "/orders", label: "Đơn hàng của tôi" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Liên hệ</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="mailto:hotline@shopvn.demo" className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors group">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  <span>hotline@shopvn.demo</span>
                </a>
              </li>
              <li>
                <a href="tel:0123456789" className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors group">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  <span>0123 456 789</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </div>
              </li>
            </ul>

            {/* Newsletter mini */}
            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2">Nhận ưu đãi qua email:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ShopVN E-Commerce. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
