"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Thêm sản phẩm</h2>
      <ProductForm
        onSubmit={async (formData) => {
          await productsApi.create(formData);
          toast.success("Đã tạo sản phẩm");
          router.push("/admin/products");
        }}
      />
    </div>
  );
}
