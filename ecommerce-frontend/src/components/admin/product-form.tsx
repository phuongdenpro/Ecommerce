"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categoriesApi } from "@/lib/api/categories";
import { brandsApi } from "@/lib/api/brands";
import type { ProductDetail, Category, Brand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  discountPrice: z.number().optional(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(1),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  status: z.enum(["Active", "Inactive", "OutOfStock"]),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: ProductDetail;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description ?? "",
          price: defaultValues.price,
          discountPrice: defaultValues.discountPrice,
          stockQuantity: defaultValues.stockQuantity,
          sku: defaultValues.sku,
          categoryId: defaultValues.categoryId,
          brandId: defaultValues.brandId,
          status: defaultValues.status as FormValues["status"],
          isFeatured: defaultValues.isFeatured,
        }
      : {
          status: "Active",
          isFeatured: false,
          stockQuantity: 0,
        },
  });

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(true),
      brandsApi.getAll(true),
    ]).then(([c, b]) => {
      setCategories(c);
      setBrands(b);
    });
  }, []);

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);

  const submit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (images) {
        Array.from(images).forEach((file) => fd.append("images", file));
      }
      await onSubmit(fd);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-xl border bg-white p-6">
      <Input label="Tên" error={errors.name?.message} {...register("name")} />
      <Textarea label="Mô tả" rows={4} {...register("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Giá"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <Input
          label="Giá giảm"
          type="number"
          step="0.01"
          {...register("discountPrice", { valueAsNumber: true })}
        />
        <Input
          label="Tồn kho"
          type="number"
          error={errors.stockQuantity?.message}
          {...register("stockQuantity", { valueAsNumber: true })}
        />
        <Input label="SKU" error={errors.sku?.message} {...register("sku")} />
      </div>
      <Select label="Danh mục" error={errors.categoryId?.message} {...register("categoryId")}>
        <option value="">Chọn</option>
        {flatCategories(categories).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select label="Thương hiệu" error={errors.brandId?.message} {...register("brandId")}>
        <option value="">Chọn</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
      <Select label="Trạng thái" {...register("status")}>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="OutOfStock">OutOfStock</option>
      </Select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isFeatured")} />
        Sản phẩm nổi bật
      </label>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Ảnh sản phẩm</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
          className="text-sm"
        />
      </div>
      <Button type="submit" isLoading={submitting}>
        Lưu
      </Button>
    </form>
  );
}
