import { useEffect, useState } from "react";
import { StickyNote, Save, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const KEY = "alakowe.admin.notes";

function readAll(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function writeAll(map: Record<string, string>) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* noop */ }
}

interface Props {
  entityId: string;
  title?: string;
  description?: string;
  className?: string;
}

export function AdminNote({ entityId, title = "Admin Note", description = "Internal note — only visible to admins.", className }: Props) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(readAll()[entityId] ?? "");
    setSaved(false);
  }, [entityId]);

  const save = () => {
    const map = readAll();
    map[entityId] = value;
    writeAll(map);
    setSaved(true);
    toast("Note saved");
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-soft ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/30 text-primary">
            <StickyNote className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">{title}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button size="sm" onClick={save} className="h-8 gap-1.5">
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a private note for the admin team…"
        className="min-h-[90px] resize-none rounded-xl"
      />
    </div>
  );
}
