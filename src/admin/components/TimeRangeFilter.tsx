import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type RangeKey = "today" | "yesterday" | "week" | "month" | "quarter" | "year" | "custom";
export type RangeValue = { key: RangeKey; from: Date; to: Date; label: string };

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

export function presetRange(key: RangeKey, from?: Date, to?: Date): RangeValue {
  const now = new Date();
  switch (key) {
    case "today": return { key, from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "yesterday": {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { key, from: startOfDay(y), to: endOfDay(y), label: "Yesterday" };
    }
    case "week": {
      const f = new Date(now); f.setDate(f.getDate() - 6);
      return { key, from: startOfDay(f), to: endOfDay(now), label: "This Week" };
    }
    case "month": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { key, from: f, to: endOfDay(now), label: "This Month" };
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const f = new Date(now.getFullYear(), q * 3, 1);
      return { key, from: f, to: endOfDay(now), label: "This Quarter" };
    }
    case "year": {
      const f = new Date(now.getFullYear(), 0, 1);
      return { key, from: f, to: endOfDay(now), label: "This Year" };
    }
    case "custom": {
      const f = from ? startOfDay(from) : startOfDay(now);
      const t = to ? endOfDay(to) : endOfDay(now);
      const lbl = `${f.toLocaleDateString()} – ${t.toLocaleDateString()}`;
      return { key, from: f, to: t, label: lbl };
    }
  }
}

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
];

interface Props {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  className?: string;
}

export function TimeRangeFilter({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState<Date | undefined>(value.from);
  const [to, setTo] = useState<Date | undefined>(value.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-10 gap-1.5 rounded-xl border-border bg-card font-semibold", className)}
        >
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span className="text-xs">{value.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-2">
        {!customOpen ? (
          <ul className="space-y-0.5">
            {PRESETS.map((p) => {
              const active = value.key === p.key;
              return (
                <li key={p.key}>
                  <button
                    onClick={() => { onChange(presetRange(p.key)); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-all",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">{p.label}</span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
            <li className="border-t border-border/60 pt-1 mt-1">
              <button
                onClick={() => setCustomOpen(true)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-all hover:bg-muted",
                  value.key === "custom" && "bg-secondary/40 text-primary"
                )}
              >
                <span className="font-medium">Custom Date</span>
                <CalendarIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          </ul>
        ) : (
          <div className="space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">From</p>
            <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className="p-0 pointer-events-auto" />
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">To</p>
            <Calendar mode="single" selected={to} onSelect={setTo} className="p-0 pointer-events-auto" />
            <div className="flex justify-end gap-1.5 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setCustomOpen(false)}>Back</Button>
              <Button size="sm" onClick={() => {
                if (from && to) { onChange(presetRange("custom", from, to)); setCustomOpen(false); setOpen(false); }
              }}>Apply</Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const defaultRange = (): RangeValue => presetRange("month");
