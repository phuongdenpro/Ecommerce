import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = "md",
  label = "Đang tải...",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "animate-spin rounded-full border-indigo-200 border-t-indigo-600",
          sizes[size],
          className,
        )}
        role="status"
        aria-label={label}
      />
      {size !== "sm" && (
        <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">{label}</p>
      )}
    </div>
  );
}
