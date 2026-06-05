import { Input } from "@/components/ui/input";

export function AdminDateRange({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        label="Từ ngày"
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="w-40"
      />
      <Input
        label="Đến ngày"
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="w-40"
      />
    </div>
  );
}
