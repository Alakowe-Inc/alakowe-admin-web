import { cn } from "@/lib/utils";

type Status = string;

const map: Record<string, string> = {
  Active: "bg-success/10 text-success ring-success/20",
  Verified: "bg-info/10 text-info ring-info/20",
  Flagged: "bg-warning/15 text-warning ring-warning/30",
  Suspended: "bg-muted text-muted-foreground ring-border",
  Banned: "bg-destructive/10 text-destructive ring-destructive/20",
  Approved: "bg-success/10 text-success ring-success/20",
  Pending: "bg-warning/15 text-warning ring-warning/30",
  Rejected: "bg-destructive/10 text-destructive ring-destructive/20",
  Paid: "bg-success/10 text-success ring-success/20",
  Processing: "bg-info/10 text-info ring-info/20",
  Shipped: "bg-secondary/40 text-primary ring-secondary/60",
  Delivered: "bg-success/10 text-success ring-success/20",
  Cancelled: "bg-muted text-muted-foreground ring-border",
  Requested: "bg-warning/15 text-warning ring-warning/30",
  Scheduled: "bg-info/10 text-info ring-info/20",
  Completed: "bg-success/10 text-success ring-success/20",
  "Pending Verification": "bg-warning/15 text-warning ring-warning/30",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        map[status] ?? "bg-muted text-muted-foreground ring-border"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
