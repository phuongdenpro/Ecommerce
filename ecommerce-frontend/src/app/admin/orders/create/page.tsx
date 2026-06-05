"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  adminCustomerService,
  adminOrderService,
  adminSettingsService,
} from "@/features/admin/services";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin";
import type { ProductListItem } from "@/types";
import { productsApi } from "@/lib/api/products";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MoneyText } from "@/features/admin/components/money-text";
import { formatCurrency } from "@/lib/utils";

type LineItem = { productId: string; productName: string; quantity: number; unitPrice: number };

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<AdminUserListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUserDetail | null>(null);
  const [addressId, setAddressId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [lines, setLines] = useState<LineItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cod");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [shippingFee, setShippingFee] = useState(30000);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminSettingsService.get().then((s) => setShippingFee(s.defaultShippingFee)).catch(() => {});
  }, []);

  const searchCustomers = useCallback(async () => {
    const result = await adminCustomerService.getCustomers({
      search: customerSearch || undefined,
      pageSize: 10,
    });
    setCustomers(result.items);
  }, [customerSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 1) searchCustomers();
    }, 300);
    return () => clearTimeout(t);
  }, [step, searchCustomers]);

  const searchProducts = useCallback(async () => {
    const result = await productsApi.getProducts({
      search: productSearch || undefined,
      pageSize: 10,
      inStock: true,
    });
    setProducts(result.items);
  }, [productSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 3) searchProducts();
    }, 300);
    return () => clearTimeout(t);
  }, [step, searchProducts]);

  const selectCustomer = async (id: string) => {
    const detail = await adminCustomerService.getById(id);
    setSelectedCustomer(detail);
    const defaultAddr = detail.addresses.find((a) => a.isDefault) ?? detail.addresses[0];
    if (defaultAddr) {
      setAddressId(defaultAddr.id);
      setShippingAddress(
        `${defaultAddr.fullName}, ${defaultAddr.phoneNumber}, ${defaultAddr.addressLine}, ${defaultAddr.city}`,
      );
    } else {
      setAddressId("");
      setShippingAddress("");
    }
    setStep(2);
  };

  const addProduct = (p: ProductListItem) => {
    const unitPrice = p.discountPrice ?? p.price;
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        { productId: p.id, productName: p.name, quantity: 1, unitPrice },
      ];
    });
  };

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const total = subtotal + shippingFee;

  const submit = async () => {
    if (!selectedCustomer) return;
    if (!lines.length) {
      toast.error("Thêm ít nhất một sản phẩm");
      return;
    }
    if (!addressId && !shippingAddress.trim()) {
      toast.error("Chọn địa chỉ hoặc nhập địa chỉ giao hàng");
      return;
    }
    setSubmitting(true);
    try {
      const order = await adminOrderService.createForCustomer({
        customerId: selectedCustomer.id,
        addressId: addressId || undefined,
        shippingAddress: addressId ? undefined : shippingAddress,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        couponCode: couponCode || undefined,
        paymentMethod,
        paymentStatus,
        shippingFee,
        note: note || undefined,
      });
      toast.success(`Đã tạo đơn ${order.orderCode}`);
      router.push(`/admin/orders/${order.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tạo được đơn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Tạo đơn hàng"
        description="Tạo đơn thay khách hàng"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Đơn hàng", href: "/admin/orders" },
          { label: "Tạo đơn" },
        ]}
      />

      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 rounded-lg border py-2 text-center text-sm font-medium ${
              step === s ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "bg-white text-slate-500"
            }`}
          >
            Bước {s}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Chọn khách hàng</h3>
            <AdminSearchInput
              value={customerSearch}
              onChange={setCustomerSearch}
              placeholder="Tìm tên, email, SĐT..."
            />
            <ul className="divide-y rounded-lg border">
              {customers.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                    onClick={() => selectCustomer(c.id)}
                  >
                    <span>
                      <span className="font-medium">{c.fullName}</span>
                      <span className="ml-2 text-slate-500">{c.email}</span>
                    </span>
                  </button>
                </li>
              ))}
              {customers.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-slate-500">Không tìm thấy khách</li>
              )}
            </ul>
          </div>
        )}

        {step === 2 && selectedCustomer && (
          <div className="space-y-4">
            <h3 className="font-semibold">Địa chỉ giao — {selectedCustomer.fullName}</h3>
            {selectedCustomer.addresses.length > 0 ? (
              <div className="space-y-2">
                {selectedCustomer.addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                      addressId === a.id ? "border-indigo-600 bg-indigo-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => {
                        setAddressId(a.id);
                        setShippingAddress(
                          `${a.fullName}, ${a.phoneNumber}, ${a.addressLine}, ${a.city}`,
                        );
                      }}
                    />
                    <span className="text-sm">
                      {a.fullName} — {a.addressLine}, {a.city}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Khách chưa có địa chỉ. Nhập địa chỉ thủ công:</p>
            )}
            <Input
              label="Địa chỉ giao hàng"
              value={shippingAddress}
              onChange={(e) => {
                setShippingAddress(e.target.value);
                setAddressId("");
              }}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Quay lại
              </Button>
              <Button onClick={() => setStep(3)}>Tiếp</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Sản phẩm</h3>
            <AdminSearchInput
              value={productSearch}
              onChange={setProductSearch}
              placeholder="Tìm sản phẩm..."
            />
            <ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm">
                    {p.name} — {formatCurrency(p.discountPrice ?? p.price)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => addProduct(p)}>
                    Thêm
                  </Button>
                </li>
              ))}
            </ul>
            {lines.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">SP</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.productId} className="border-t">
                      <td className="py-2">{l.productName}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="w-16 rounded border px-2 py-1"
                          value={l.quantity}
                          onChange={(e) => {
                            const q = Math.max(1, Number(e.target.value) || 1);
                            setLines((prev) =>
                              prev.map((x) =>
                                x.productId === l.productId ? { ...x, quantity: q } : x,
                              ),
                            );
                          }}
                        />
                      </td>
                      <td>{formatCurrency(l.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Quay lại
              </Button>
              <Button onClick={() => setStep(4)} disabled={!lines.length}>
                Tiếp
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Thanh toán & xác nhận</h3>
            <Input label="Mã giảm giá" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <Input
              label="Phí ship (VND)"
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
            />
            <Select label="Phương thức" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="Cod">COD</option>
              <option value="BankTransfer">Chuyển khoản</option>
              <option value="OnlinePayment">Online</option>
            </Select>
            <Select label="TT thanh toán" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </Select>
            <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
            <p className="text-lg font-semibold">
              Tạm tính: <MoneyText amount={total} />
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Quay lại
              </Button>
              <Button onClick={submit} isLoading={submitting}>
                Tạo đơn hàng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
