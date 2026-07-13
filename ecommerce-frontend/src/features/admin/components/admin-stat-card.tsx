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
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-700 group-hover:text-white",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-700/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </p>
          {subtext && (
            <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
              {subtext}
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-3 transition-colors duration-300", accents[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
