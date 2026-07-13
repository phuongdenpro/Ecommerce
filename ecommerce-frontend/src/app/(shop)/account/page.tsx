"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, ShoppingBag, Heart, LogOut, ChevronRight, Mail, Phone } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự."),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type Tab = "profile" | "password";

export default function AccountPage() {
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");

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
      toast.success("Đã cập nhật thông tin hồ sơ thành công!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    }
  };

  const changePassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const initials = profile?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Profile header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/30">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{profile?.fullName}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              {profile?.email}
            </div>
            {profile?.phoneNumber && (
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                {profile.phoneNumber}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          onClick={() => logout().then(() => (window.location.href = "/"))}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {[
          { href: "/orders", icon: ShoppingBag, label: "Đơn hàng", sub: "Xem lịch sử mua hàng" },
          { href: "/wishlist", icon: Heart, label: "Yêu thích", sub: "Sản phẩm đã lưu" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-4 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
        {[
          { id: "profile" as Tab, icon: User, label: "Thông tin cá nhân" },
          { id: "password" as Tab, icon: Lock, label: "Đổi mật khẩu" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-6 animate-scale-in">
        {tab === "profile" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">Thông tin cá nhân</h2>
            <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
              <Input
                label="Họ và tên"
                error={profileForm.formState.errors.fullName?.message}
                {...profileForm.register("fullName")}
              />
              <Input
                label="Số điện thoại"
                placeholder="0901 234 567"
                {...profileForm.register("phoneNumber")}
              />
              <Button
                type="submit"
                isLoading={profileForm.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                Lưu thay đổi
              </Button>
            </form>
          </>
        )}

        {tab === "password" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">Đổi mật khẩu</h2>
            <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
              <Button
                type="submit"
                isLoading={passwordForm.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                Đổi mật khẩu
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
