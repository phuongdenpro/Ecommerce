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

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
  { value: "3", label: "OutOfStock" },
];

const normalizeStatus = (status: string | number | undefined) => {
  const normalized = status === undefined || status === null ? "" : String(status);
  return (
    {
      Active: "1",
      Inactive: "2",
      OutOfStock: "3",
      "1": "1",
      "2": "2",
      "3": "3",
    }[normalized] ?? "1"
  );
};

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  discountPrice: z.number().optional(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(1),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  brandId: z.string().min(1, "Vui lòng chọn thương hiệu"),
  status: z.enum(["1", "2", "3"]),
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      discountPrice: defaultValues?.discountPrice,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
      sku: defaultValues?.sku ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      brandId: defaultValues?.brandId ?? "",
      status: defaultValues ? normalizeStatus(defaultValues.status) as FormValues["status"] : "1",
      isFeatured: defaultValues?.isFeatured ?? false,
    },
  });

  useEffect(() => {
    categoriesApi.getAll(true)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
    
    brandsApi.getAll(true)
      .then(setBrands)
      .catch(console.error)
      .finally(() => setBrandsLoading(false));
  }, []);

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);

  const hasCategoryOption = (categoryId?: string) =>
    !!categoryId && flatCategories(categories).some((c) => c.id === categoryId);

  const hasBrandOption = (brandId?: string) =>
    !!brandId && brands.some((b) => b.id === brandId);

  useEffect(() => {
    if (!defaultValues || categoriesLoading || brandsLoading) return;

    reset({
      name: defaultValues.name,
      description: defaultValues.description ?? "",
      price: defaultValues.price,
      discountPrice: defaultValues.discountPrice,
      stockQuantity: defaultValues.stockQuantity,
      sku: defaultValues.sku,
      categoryId: defaultValues.categoryId,
      brandId: defaultValues.brandId,
      status: normalizeStatus(defaultValues.status) as FormValues["status"],
      isFeatured: defaultValues.isFeatured,
    });
  }, [defaultValues, categoriesLoading, brandsLoading, reset]);

  const submit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const fd = new FormData();

      const fieldMap: Record<string, string> = {
        name: "Name",
        description: "Description",
        price: "Price",
        discountPrice: "DiscountPrice",
        stockQuantity: "StockQuantity",
        sku: "SKU",
        categoryId: "CategoryId",
        brandId: "BrandId",
        status: "Status",
        isFeatured: "IsFeatured",
      };

      Object.entries(values).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (typeof v === "string" && v === "") return;
        if (typeof v === "number" && Number.isNaN(v)) return;
        if (k === "isFeatured" && v === false) return;
        fd.append(fieldMap[k] ?? k, String(v));
      });

      if (images) {
        Array.from(images).forEach((file) => fd.append("images", file));
      }

      console.log(
        "ProductForm submit payload",
        Array.from(fd.entries()).map(([key, value]) => [
          key,
          value instanceof File ? value.name : value,
        ]),
      );

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
      <Select label="Danh mục" error={errors.categoryId?.message} {...register("categoryId")} disabled={categoriesLoading}>
        <option value="">{categoriesLoading ? "Đang tải..." : "Chọn"}</option>
        {defaultValues && !hasCategoryOption(defaultValues.categoryId) && (
          <option value={defaultValues.categoryId}>{defaultValues.categoryName}</option>
        )}
        {flatCategories(categories).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select label="Thương hiệu" error={errors.brandId?.message} {...register("brandId")} disabled={brandsLoading}>
        <option value="">{brandsLoading ? "Đang tải..." : "Chọn"}</option>
        {defaultValues && !hasBrandOption(defaultValues.brandId) && (
          <option value={defaultValues.brandId}>{defaultValues.brandName}</option>
        )}
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
      <Select label="Trạng thái" {...register("status")}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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
