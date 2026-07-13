import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2.5 flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                {b.href ? (
                  <Link href={b.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className={cn(i === breadcrumbs.length - 1 && "text-slate-700 dark:text-slate-300")}>
                    {b.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
