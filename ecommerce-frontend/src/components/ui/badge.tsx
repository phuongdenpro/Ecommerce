import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "purple";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const variants: Record<Variant, string> = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
    warning: "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-400",
    danger:  "bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-400",
    info:    "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-400",
    purple:  "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
