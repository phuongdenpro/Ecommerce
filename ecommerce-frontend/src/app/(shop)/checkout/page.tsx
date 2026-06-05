"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { addressesApi } from "@/lib/api/addresses";
import { ordersApi } from "@/lib/api/orders";
import { couponsApi } from "@/lib/api/coupons";
import { paymentsApi } from "@/lib/api/payments";
import type { Address } from "@/types";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
  addressId: z.string().optional(),
  shippingAddress: z.string().min(10, "Địa chỉ giao hàng tối thiểu 10 ký tự"),
  note: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["0", "1", "2"]),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    fullName: "",
    phoneNumber: "",
    addressLine: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "0" },
  });

  const shippingFee = 30000;
  const subTotal = cart?.subTotal ?? 0;
  const total = subTotal + shippingFee - discount;

  useEffect(() => {
    fetchCart();
    addressesApi.getAll().then(setAddresses).catch(() => {});
  }, [fetchCart]);

  useEffect(() => {
    // show new address form when there are no saved addresses
    if (addresses.length === 0) setShowNewAddressForm(true);
  }, [addresses.length]);

  const validateCoupon = async () => {
    const code = watch("couponCode");
    if (!code) return;
    try {
      const result = await couponsApi.validate(code, subTotal);
      if (result.isValid) {
        setDiscount(result.discountAmount);
        toast.success(result.message || "Áp dụng mã thành công");
      } else {
        setDiscount(0);
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mã không hợp lệ");
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        addressId: data.addressId || undefined,
        shippingAddress: data.shippingAddress,
        note: data.note,
        couponCode: data.couponCode || undefined,
        shippingFee,
      });

      if (Number(data.paymentMethod) !== 0) {
        await paymentsApi.process(order.id, Number(data.paymentMethod));
      }

      toast.success("Đặt hàng thành công!");
      router.push(`/orders/${order.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Đặt hàng thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {addresses.length > 0 && (
          <Select
            label="Địa chỉ đã lưu"
            {...register("addressId")}
            onChange={(e) => {
              const val = e.target.value;
              setValue("addressId", val);
              if (val === "new") {
                setShowNewAddressForm(true);
                setValue("shippingAddress", "");
                return;
              }
              setShowNewAddressForm(false);
              const addr = addresses.find((a) => a.id === val);
              if (addr) {
                setValue(
                  "shippingAddress",
                  `${addr.addressLine}, ${addr.ward ?? ""}, ${addr.district ?? ""}, ${addr.city}`,
                );
              }
            }}
          >
            <option value="">Chọn địa chỉ</option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} — {a.addressLine}
              </option>
            ))}
            <option value="new">Thêm địa chỉ mới</option>
          </Select>
        )}

        {/* list saved addresses with actions */}
        {addresses.length > 0 && (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">{a.fullName} {a.isDefault && <span className="ml-2 text-xs text-emerald-600">(Mặc định)</span>}</div>
                  <div className="text-sm text-slate-600">{a.addressLine}, {a.ward ?? ''} {a.district ?? ''}, {a.city}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        // edit
                        setEditingAddressId(a.id);
                        setNewAddress({ ...a });
                        setShowNewAddressForm(true);
                        setValue("addressId", a.id);
                        setValue(
                          "shippingAddress",
                          `${a.addressLine}, ${a.ward ?? ""}, ${a.district ?? ""}, ${a.city}`,
                        );
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await addressesApi.delete(a.id);
                          setAddresses((s) => s.filter((x) => x.id !== a.id));
                          if (watch("addressId") === a.id) {
                            setValue("addressId", "");
                            setValue("shippingAddress", "");
                          }
                          toast.success("Xóa địa chỉ thành công");
                        } catch (e) {
                          toast.error(getErrorMessage(e, "Xóa địa chỉ thất bại"));
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                  {!a.isDefault && (
                    <Button
                      size="sm"
                      type="button"
                      onClick={async () => {
                        try {
                          await addressesApi.setDefault(a.id);
                          const list = await addressesApi.getAll();
                          setAddresses(list);
                          setValue("addressId", a.id);
                          setValue(
                            "shippingAddress",
                            `${a.addressLine}, ${a.ward ?? ""}, ${a.district ?? ""}, ${a.city}`,
                          );
                          toast.success("Đặt địa chỉ mặc định thành công");
                        } catch (e) {
                          toast.error(getErrorMessage(e, "Đặt mặc định thất bại"));
                        }
                      }}
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Textarea
          label="Địa chỉ giao hàng"
          disabled
          rows={3}
          error={errors.shippingAddress?.message}
          {...register("shippingAddress")}
          readOnly={Boolean(addresses.find((a) => a.id === watch("addressId")))}
        />

        {showNewAddressForm && (
          <div className="space-y-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">Thêm địa chỉ mới</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                label="Họ và tên"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress((s) => ({ ...s, fullName: e.target.value }))}
              />
              <Input
                label="Số điện thoại"
                value={newAddress.phoneNumber}
                onChange={(e) => setNewAddress((s) => ({ ...s, phoneNumber: e.target.value }))}
              />
            </div>
            <Input
              label="Địa chỉ (số nhà, đường)"
              value={newAddress.addressLine}
              onChange={(e) => setNewAddress((s) => ({ ...s, addressLine: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                label="Phường / Xã"
                value={newAddress.ward}
                onChange={(e) => setNewAddress((s) => ({ ...s, ward: e.target.value }))}
              />
              <Input
                label="Quận / Huyện"
                value={newAddress.district}
                onChange={(e) => setNewAddress((s) => ({ ...s, district: e.target.value }))}
              />
              <Input
                label="Tỉnh / Thành phố"
                value={newAddress.city}
                onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isDefault"
                type="checkbox"
                checked={!!newAddress.isDefault}
                onChange={(e) => setNewAddress((s) => ({ ...s, isDefault: e.target.checked }))}
              />
              <label htmlFor="isDefault" className="text-sm">Đặt làm địa chỉ mặc định</label>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const payload = {
                      fullName: newAddress.fullName || "",
                      phoneNumber: newAddress.phoneNumber || "",
                      addressLine: newAddress.addressLine || "",
                      ward: newAddress.ward || "",
                      district: newAddress.district || "",
                      city: newAddress.city || "",
                    };

                    if (editingAddressId) {
                      // update existing
                      await addressesApi.update(editingAddressId, payload as any);
                      if (newAddress.isDefault) {
                        await addressesApi.setDefault(editingAddressId);
                      }
                      const list = await addressesApi.getAll();
                      setAddresses(list);
                      const updated = list.find((x) => x.id === editingAddressId)!;
                      setValue("addressId", updated.id);
                      setValue(
                        "shippingAddress",
                        `${updated.addressLine}, ${updated.ward ?? ""}, ${updated.district ?? ""}, ${updated.city}`,
                      );
                      toast.success("Cập nhật địa chỉ thành công");
                    } else {
                      // create new
                      const created = await addressesApi.create(payload as any);
                      if (newAddress.isDefault) {
                        await addressesApi.setDefault(created.id);
                      }
                      const list = await addressesApi.getAll();
                      setAddresses(list);
                      setValue("addressId", created.id);
                      setValue(
                        "shippingAddress",
                        `${created.addressLine}, ${created.ward ?? ""}, ${created.district ?? ""}, ${created.city}`,
                      );
                      toast.success("Thêm địa chỉ thành công");
                    }

                    setShowNewAddressForm(false);
                    setEditingAddressId(null);
                    setNewAddress({ fullName: "", phoneNumber: "", addressLine: "", ward: "", district: "", city: "", isDefault: false });
                  } catch (e) {
                    toast.error(getErrorMessage(e, "Lưu địa chỉ thất bại"));
                  }
                }}
              >
                {editingAddressId ? "Lưu thay đổi" : "Thêm địa chỉ"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowNewAddressForm(false)}>
                Hủy
              </Button>
            </div>
          </div>
        )}
        <Input label="Ghi chú" {...register("note")} />

        <div className="flex gap-2">
          <Input label="Mã giảm giá" placeholder="WELCOME10" {...register("couponCode")} />
          <Button type="button" variant="outline" className="mt-6" onClick={validateCoupon}>
            Áp dụng
          </Button>
        </div>

        <Select label="Phương thức thanh toán" {...register("paymentMethod")}>
          <option value="0">COD — Thanh toán khi nhận</option>
          <option value="1">Chuyển khoản</option>
          <option value="2">Thanh toán online (mock)</option>
        </Select>

        <div className="rounded-xl border bg-white p-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Phí ship</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Giảm giá</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Tổng</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
          Đặt hàng
        </Button>
      </form>
    </div>
  );
}
