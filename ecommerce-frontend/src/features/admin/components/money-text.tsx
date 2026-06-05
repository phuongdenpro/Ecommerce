import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function MoneyText({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return <span className={cn("tabular-nums", className)}>{formatCurrency(amount)}</span>;
}
