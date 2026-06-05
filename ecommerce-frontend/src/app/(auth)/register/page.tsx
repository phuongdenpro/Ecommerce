"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
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
      toast.success("Đăng ký thành công");
      router.push("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Đăng ký thất bại");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Đăng ký
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
