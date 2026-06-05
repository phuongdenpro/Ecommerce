import { ErrorState } from "@/components/ui/error-state";

export function AdminErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-white p-6">
      <ErrorState message={message} onRetry={onRetry} />
    </div>
  );
}
