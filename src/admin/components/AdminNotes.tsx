import { useEffect, useState } from "react";
import { StickyNote, Send, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const KEY = "alakowe.admin.notes.multi";

export type AdminNoteEntry = { id: string; ts: string; author: string; text: string };

function readAll(): Record<string, AdminNoteEntry[]> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function writeAll(map: Record<string, AdminNoteEntry[]>) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* noop */ }
}

export function getNotes(entityId: string): AdminNoteEntry[] {
  return readAll()[entityId] ?? [];
}

interface Props {
  entityId: string;
  author?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function AdminNotes({
  entityId,
  author = "Akin O.",
  title = "Admin Notes",
  description = "Internal notes — visible only to your admin team.",
  className,
}: Props) {
  const [notes, setNotes] = useState<AdminNoteEntry[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => { setNotes(getNotes(entityId)); }, [entityId]);

  const persist = (next: AdminNoteEntry[]) => {
    const map = readAll(); map[entityId] = next; writeAll(map); setNotes(next);
  };

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const entry: AdminNoteEntry = {
      id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ts: new Date().toISOString(), author, text,
    };
    persist([entry, ...notes]);
    setDraft("");
    toast("Note added");
  };

  const remove = (id: string) => persist(notes.filter((n) => n.id !== id));

  return (
    <section className={`rounded-2xl border border-border bg-card shadow-soft ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/30 text-primary">
            <StickyNote className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">{title}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{notes.length} note{notes.length === 1 ? "" : "s"}</span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a note for the team…"
            className="min-h-[68px] resize-none rounded-xl"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }}
          />
          <Button onClick={add} disabled={!draft.trim()} className="h-auto gap-1.5 self-stretch px-4">
            <Send className="h-3.5 w-3.5" /> Post
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground">
            No internal notes yet. Add the first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="group rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span><span className="font-semibold text-foreground">{n.author}</span> · {new Date(n.ts).toLocaleString()}</span>
                  <button onClick={() => remove(n.id)} className="opacity-0 transition-opacity group-hover:opacity-100" title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
