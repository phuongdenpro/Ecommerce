import { EmptyState } from "@/components/ui/empty-state";

export function AdminEmptyState(props: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
      <EmptyState {...props} />
    </div>
  );
}
