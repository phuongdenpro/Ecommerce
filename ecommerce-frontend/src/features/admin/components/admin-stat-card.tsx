import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent = "indigo",
}: {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  icon: LucideIcon;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "violet" | "blue" | "slate";
}) {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
