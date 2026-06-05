"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { isAdminRole } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const redirect = searchParams.get("redirect") ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await login(data.email, data.password);
      toast.success("Đăng nhập thành công");
      const target = isAdminRole(auth.user.role)
        ? redirect.startsWith("/admin")
          ? redirect
          : "/admin"
        : redirect;
      router.push(target);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
      <p className="mt-1 text-sm text-slate-500">Chào mừng trở lại ShopVN</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Đăng nhập
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Đăng ký
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        Admin: admin@ecommerce.com / Admin@123
      </p>
    </div>
  );
}
