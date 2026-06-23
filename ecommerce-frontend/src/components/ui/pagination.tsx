"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function Pagination({
  pageNumber,
  totalPages,
  totalItems,
  onPageChange,
}: {
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const showButtons = totalPages > 1;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
      {showButtons && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber <= 1}
            onClick={() => onPageChange(pageNumber - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">
            Trang {pageNumber} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber >= totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="text-sm text-slate-600 text-center">
        Tổng {totalItems} bản ghi
      </div>
    </div>
  );
}
