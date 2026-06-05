"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const profileSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function AccountPage() {
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileForm = useForm({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    usersApi
      .getProfile()
      .then((p) => {
        setProfile(p);
        profileForm.reset({ fullName: p.fullName, phoneNumber: p.phoneNumber ?? "" });
      })
      .finally(() => setLoading(false));
  }, [profileForm]);

  const saveProfile = async (data: z.infer<typeof profileSchema>) => {
    try {
      const updated = await usersApi.updateProfile(data);
      setProfile(updated);
      setUser({
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        avatarUrl: updated.avatarUrl,
        role: updated.role as "Customer",
      });
      toast.success("Đã cập nhật hồ sơ");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const changePassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success("Đổi mật khẩu thành công");
      passwordForm.reset();
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <Button variant="outline" onClick={() => logout().then(() => (window.location.href = "/"))}>
          Đăng xuất
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-slate-500">Email: {profile?.email}</p>
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="mt-4 space-y-4">
          <Input label="Họ tên" {...profileForm.register("fullName")} />
          <Input label="Số điện thoại" {...profileForm.register("phoneNumber")} />
          <Button type="submit">Lưu hồ sơ</Button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Đổi mật khẩu</h2>
        <form
          onSubmit={passwordForm.handleSubmit(changePassword)}
          className="mt-4 space-y-4"
        >
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            {...passwordForm.register("currentPassword")}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <Input
            label="Xác nhận"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />
          <Button type="submit" variant="secondary">
            Đổi mật khẩu
          </Button>
        </form>
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/orders" className="text-indigo-600 hover:underline">
          Đơn hàng
        </Link>
        <Link href="/wishlist" className="text-indigo-600 hover:underline">
          Yêu thích
        </Link>
      </div>
    </div>
  );
}
