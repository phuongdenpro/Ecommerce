"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import type { ProductDetail } from "@/types";
import { ProductForm } from "@/components/admin/product-form";
import { Spinner } from "@/components/ui/spinner";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    productsApi.getById(id).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Sửa sản phẩm</h2>
      <ProductForm
        defaultValues={product}
        onSubmit={async (formData) => {
          await productsApi.update(id, formData);
          toast.success("Đã cập nhật");
          router.push("/admin/products");
        }}
      />
    </div>
  );
}
