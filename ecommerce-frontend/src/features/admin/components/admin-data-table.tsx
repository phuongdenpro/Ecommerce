"use client";

import { AdminEmptyState } from "./admin-empty-state";
import { AdminErrorState } from "./admin-error-state";
import { AdminLoadingSkeleton } from "./admin-loading-skeleton";

export function AdminDataTable({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (loading) return <AdminLoadingSkeleton rows={5} cols={5} />;
  if (error) return <AdminErrorState message={error} onRetry={onRetry} />;
  if (empty)
    return (
      <AdminEmptyState title={emptyTitle} description={emptyDescription} />
    );
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}
