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
              setValue("addressId", e.target.value);
              const addr = addresses.find((a) => a.id === e.target.value);
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
          </Select>
        )}

        <Textarea
          label="Địa chỉ giao hàng"
          rows={3}
          error={errors.shippingAddress?.message}
          {...register("shippingAddress")}
        />
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
