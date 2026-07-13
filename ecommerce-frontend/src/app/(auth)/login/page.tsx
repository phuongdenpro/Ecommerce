"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { isAdminRole } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Email không hợp lệ. Vui lòng kiểm tra lại."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
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
      toast.success("Đăng nhập thành công! Chào mừng trở lại 👋");
      const target = isAdminRole(auth.user.role)
        ? redirect.startsWith("/admin")
          ? redirect
          : "/admin"
        : redirect;
      router.push(target);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.",
      );
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      {/* Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/90 backdrop-blur">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">ShopVN</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mua sắm thông minh</p>
          </div>
        </div>

        <h1 className="text-center text-xl font-bold text-slate-800 dark:text-slate-100">
          Chào mừng trở lại!
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Đăng nhập để tiếp tục mua sắm
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            Đăng nhập
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 transition-colors">
            Đăng ký miễn phí
          </Link>
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Demo Admin:</span>{" "}
            admin@ecommerce.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
