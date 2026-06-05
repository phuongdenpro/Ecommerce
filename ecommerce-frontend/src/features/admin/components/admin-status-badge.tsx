import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const orderColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-indigo-100 text-indigo-800",
  Shipping: "bg-violet-100 text-violet-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

const paymentColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Failed: "bg-red-100 text-red-800",
  Refunded: "bg-slate-100 text-slate-800",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        orderColors[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        paymentColors[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const variant =
    role === "Admin" ? "danger" : role === "Staff" ? "warning" : "default";
  return <Badge variant={variant}>{role}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "default"}>
      {active ? "Hoạt động" : "Đã khóa"}
    </Badge>
  );
}
