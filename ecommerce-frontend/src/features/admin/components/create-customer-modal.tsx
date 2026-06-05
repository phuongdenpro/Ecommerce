"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { adminCustomerService } from "@/features/admin/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function CreateCustomerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      await adminCustomerService.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        role: "Customer",
      });
      toast.success("Đã tạo khách hàng");
      reset();
      onCreated();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tạo được khách hàng");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">Thêm khách hàng</h2>
        <p className="mt-1 text-sm text-slate-500">Tạo tài khoản Customer mới trên hệ thống.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <Input label="Họ tên" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Số điện thoại" {...register("phoneNumber")} />
          <Input
            label="Mật khẩu"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Tạo khách hàng
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
