"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { adminCustomerService, adminOrderService } from "@/features/admin/services";
import type { AdminUserDetail } from "@/types/admin";
import type { Address, OrderListItem, WishlistItem } from "@/types";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveBadge, RoleBadge } from "@/features/admin/components/admin-status-badge";
import { MoneyText } from "@/features/admin/components/money-text";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { OrderStatusBadge } from "@/features/admin/components/admin-status-badge";
import { formatDate, resolveMediaUrl } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { AdminErrorState } from "@/features/admin/components/admin-error-state";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AdminUserDetail | null>(null);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notes, setNotes] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFullName, setAddressFullName] = useState("");
  const [addressPhoneNumber, setAddressPhoneNumber] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressWard, setAddressWard] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, o, w, n] = await Promise.all([
        adminCustomerService.getById(id),
        adminOrderService.getOrders({ userId: id, pageSize: 10 }),
        adminCustomerService.getWishlist(id).catch(() => [] as WishlistItem[]),
        adminCustomerService.getNotes(id).catch(() => ({ userId: id, adminNotes: "" })),
      ]);
      setCustomer(c);
      setOrders(o.items);
      setWishlist(w);
      setNotes(n.adminNotes ?? c.adminNotes ?? "");
      setEditFullName(c.fullName);
      setEditEmail(c.email);
      setEditPhoneNumber(c.phoneNumber ?? "");
      setAddressFullName("");
      setAddressPhoneNumber("");
      setAddressLine("");
      setAddressWard("");
      setAddressDistrict("");
      setAddressCity("");
      setAddressIsDefault(false);
      setIsAddingAddress(false);
      setEditingAddressId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await adminCustomerService.setNotes(id, notes || null);
      toast.success("Đã lưu ghi chú");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSavingNotes(false);
    }
  };

  const saveCustomerInfo = async () => {
    if (!customer) return;
    setSavingCustomer(true);
    try {
      await adminCustomerService.update(id, {
        fullName: editFullName,
        email: editEmail,
        phoneNumber: editPhoneNumber || undefined,
      });
      toast.success("Đã lưu thông tin khách hàng");
      setIsEditing(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSavingCustomer(false);
    }
  };

  const resetAddressForm = () => {
    setAddressFullName("");
    setAddressPhoneNumber("");
    setAddressLine("");
    setAddressWard("");
    setAddressDistrict("");
    setAddressCity("");
    setAddressIsDefault(false);
    setEditingAddressId(null);
  };

  const startAddAddress = () => {
    resetAddressForm();
    setIsAddingAddress(true);
  };

  const startEditAddress = (address: Address) => {
    setAddressFullName(address.fullName);
    setAddressPhoneNumber(address.phoneNumber);
    setAddressLine(address.addressLine);
    setAddressWard(address.ward ?? "");
    setAddressDistrict(address.district ?? "");
    setAddressCity(address.city);
    setAddressIsDefault(address.isDefault);
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const saveAddress = async () => {
    if (!customer) return;
    if (!addressFullName || !addressPhoneNumber || !addressLine || !addressCity) {
      toast.error("Vui lòng điền đầy đủ họ tên, số điện thoại, địa chỉ và thành phố.");
      return;
    }

    const payload = {
      fullName: addressFullName,
      phoneNumber: addressPhoneNumber,
      addressLine,
      ward: addressWard || undefined,
      district: addressDistrict || undefined,
      city: addressCity,
      isDefault: addressIsDefault,
    };

    try {
      if (editingAddressId) {
        await adminCustomerService.updateAddress(customer.id, editingAddressId, payload);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await adminCustomerService.addAddress(customer.id, payload);
        toast.success("Đã thêm địa chỉ");
      }
      resetAddressForm();
      setIsAddingAddress(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!customer) return;
    try {
      await adminCustomerService.deleteAddress(customer.id, addressId);
      toast.success("Đã xóa địa chỉ");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!customer) return;
    try {
      await adminCustomerService.setDefaultAddress(customer.id, addressId);
      toast.success("Đã đặt địa chỉ mặc định");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !customer) {
    return <AdminErrorState message={error ?? "Không tìm thấy"} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={customer.fullName}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Khách hàng", href: "/admin/customers" },
          { label: customer.fullName },
        ]}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await adminCustomerService.setActive(id, !customer.isActive);
                toast.success("Đã cập nhật");
                load();
              }}
            >
              {customer.isActive ? "Khóa tài khoản" : "Mở khóa"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 lg:col-span-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
            {customer.fullName.charAt(0)}
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <Input label="Tên" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
              <Input label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <Input
                label="Số điện thoại"
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
              />
              <Button onClick={saveCustomerInfo} isLoading={savingCustomer}>
                Lưu khách hàng
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-xl font-bold">{customer.fullName}</h2>
              <p className="text-slate-500">{customer.email}</p>
              <p className="mt-1">{customer.phoneNumber ?? "—"}</p>
              <div className="mt-4 flex gap-2">
                <RoleBadge role={customer.role} />
                <ActiveBadge active={customer.isActive} />
              </div>
            </>
          )}
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Tổng đơn</dt>
              <dd className="font-semibold">{customer.totalOrders}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Tổng chi tiêu</dt>
              <dd className="font-semibold">
                <MoneyText amount={customer.totalSpent} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Ngày đăng ký</dt>
              <dd>{formatDate(customer.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold">Ghi chú nội bộ (CRM)</h3>
            <textarea
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú chỉ admin/staff thấy..."
            />
            <Button className="mt-2" size="sm" onClick={saveNotes} isLoading={savingNotes}>
              Lưu ghi chú
            </Button>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Địa chỉ</h3>
                <p className="text-sm text-slate-500">Quản lý địa chỉ giao hàng của khách.</p>
              </div>
              <Button size="sm" onClick={startAddAddress}>
                Thêm địa chỉ
              </Button>
            </div>

            {customer.addresses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Chưa có địa chỉ.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {customer.addresses.map((a) => (
                  <li key={a.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {a.fullName} {a.isDefault && "(Mặc định)"}
                        </p>
                        <p className="text-slate-600">
                          {a.addressLine}, {a.city}
                        </p>
                        <p className="text-slate-500">{a.phoneNumber}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3 sm:pt-0">
                        <Button size="sm" variant="outline" onClick={() => startEditAddress(a)}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteAddress(a.id)}>
                          Xóa
                        </Button>
                        {!a.isDefault && (
                          <Button size="sm" variant="outline" onClick={() => setDefaultAddress(a.id)}>
                            Mặc định
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isAddingAddress && (
              <div className="mt-6 rounded-xl border bg-slate-50 p-4">
                <h4 className="mb-3 text-base font-semibold">{editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Họ tên" value={addressFullName} onChange={(e) => setAddressFullName(e.target.value)} />
                  <Input
                    label="Số điện thoại"
                    value={addressPhoneNumber}
                    onChange={(e) => setAddressPhoneNumber(e.target.value)}
                  />
                  <Input label="Địa chỉ" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                  <Input label="Thành phố" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
                  <Input label="Phường" value={addressWard} onChange={(e) => setAddressWard(e.target.value)} />
                  <Input label="Quận/Huyện" value={addressDistrict} onChange={(e) => setAddressDistrict(e.target.value)} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={addressIsDefault}
                      onChange={(e) => setAddressIsDefault(e.target.checked)}
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                  <Button onClick={saveAddress}>{editingAddressId ? "Lưu địa chỉ" : "Thêm địa chỉ"}</Button>
                  <Button variant="outline" onClick={() => { resetAddressForm(); setIsAddingAddress(false); }}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-3 font-semibold">Wishlist</h3>
            {wishlist.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có sản phẩm yêu thích.</p>
            ) : (
              <ul className="space-y-2">
                {wishlist.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 rounded-lg border p-2">
                    {w.primaryImageUrl && (
                      <Image
                        src={resolveMediaUrl(w.primaryImageUrl)}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <Link href={`/products/${w.productId}`} className="text-sm text-indigo-600 hover:underline">
                      {w.productName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Lịch sử đơn hàng</h3>
            <AdminDataTable empty={orders.length === 0} emptyTitle="Chưa có đơn">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-2">Mã</th>
                    <th className="px-4 py-2">Tổng</th>
                    <th className="px-4 py-2">TT</th>
                    <th className="px-4 py-2">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="px-4 py-2">
                        <Link href={`/admin/orders/${o.id}`} className="text-indigo-600 hover:underline">
                          {o.orderCode}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <MoneyText amount={o.finalAmount} />
                      </td>
                      <td className="px-4 py-2">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-2 text-slate-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminDataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
