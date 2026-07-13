"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
    email: z.string().email("Email không hợp lệ. Vui lòng kiểm tra lại."),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const PERKS = [
  "Nhận ưu đãi 10% cho đơn hàng đầu tiên",
  "Theo dõi đơn hàng dễ dàng",
  "Lưu sản phẩm yêu thích",
  "Hỗ trợ khách hàng 24/7",
];

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.fullName, data.email, data.password, data.phoneNumber);
      toast.success("Đăng ký thành công! Chào mừng bạn đến với ShopVN 🎉");
      router.push("/");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.",
      );
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
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
          Tạo tài khoản mới
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Miễn phí — chỉ mất 30 giây
        </p>

        {/* Perks */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-3">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-500 mt-0.5" />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">{perk}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3.5">
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Số điện thoại (không bắt buộc)"
            placeholder="0901 234 567"
            {...register("phoneNumber")}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            Tạo tài khoản
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
