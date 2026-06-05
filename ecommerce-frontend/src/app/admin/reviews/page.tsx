"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminReviewService } from "@/features/admin/services";
import type { AdminReviewListItem } from "@/types/admin";
import type { PagedResult } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminReviewsPage() {
  const [data, setData] = useState<PagedResult<AdminReviewListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState("");
  const [hidden, setHidden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await adminReviewService.getAll({
          pageNumber: page,
          pageSize: 10,
          rating: rating ? Number(rating) : undefined,
          isHidden: hidden === "" ? undefined : hidden === "true",
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, rating, hidden]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader title="Đánh giá" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Đánh giá" }]} />

      <AdminFilterBar>
        <Select className="w-32" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
          <option value="">Số sao</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} sao</option>
          ))}
        </Select>
        <Select className="w-40" value={hidden} onChange={(e) => { setHidden(e.target.value); setPage(1); }}>
          <option value="">Hiển thị</option>
          <option value="false">Đang hiện</option>
          <option value="true">Đã ẩn</option>
        </Select>
      </AdminFilterBar>

      <AdminDataTable loading={loading} error={error} empty={!data?.items.length} onRetry={load}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Sao</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.userName}</td>
                <td className="px-4 py-3 max-w-[140px] truncate">{r.productName}</td>
                <td className="px-4 py-3">{"★".repeat(r.rating)}</td>
                <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">{r.comment ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          if (r.isHidden) await adminReviewService.unhide(r.id);
                          else await adminReviewService.hide(r.id);
                          toast.success("Đã cập nhật");
                          load();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Lỗi");
                        }
                      }}
                    >
                      {r.isHidden ? "Hiện" : "Ẩn"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination pageNumber={data.pageNumber} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </AdminDataTable>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa đánh giá?"
        message="Không thể hoàn tác."
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await adminReviewService.delete(deleteId);
            toast.success("Đã xóa");
            load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Lỗi");
          } finally {
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
