import { useState } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAllTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useAllCategories,
} from "@/lib/api/admin/admin.hooks";
import type { TagResponse } from "@/lib/api/types";
import { toast } from "react-toastify";

interface TagForm {
  name: string;
  slug: string;
  categoryId: number | null;
}

const emptyForm: TagForm = { name: "", slug: "", categoryId: null };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CatalogueTags() {
  const { data: tags, isLoading } = useAllTags();
  const { data: categories } = useAllCategories();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TagResponse | null>(null);
  const [form, setForm] = useState<TagForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<TagResponse | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const resetForm = () => { setForm(emptyForm); setSlugTouched(false); };
  const startCreate = () => { resetForm(); setCreating(true); };
  const startEdit = (t: TagResponse) => {
    setForm({ name: t.name ?? "", slug: t.slug ?? "", categoryId: t.categoryId ?? null });
    setSlugTouched(true);
    setEditing(t);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : generateSlug(value),
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) { toast("Name required"); return; }
    try {
      const body = {
        name: form.name,
        slug: form.slug || undefined,
        categoryId: form.categoryId || undefined,
      };
      if (editing) {
        await updateTag.mutateAsync({ id: editing.id, ...body });
        toast("Tag updated");
        setEditing(null);
      } else {
        await createTag.mutateAsync(body);
        toast("Tag created");
        setCreating(false);
      }
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading tags...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Tags</h1>
        <p className="text-sm text-muted-foreground">Manage book tags and category scoping.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Tag</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags?.map((t) => (
          <article key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{t.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">/{t.slug}</p>
                </div>
              </div>
            </div>
            {t.categoryName && (
              <span className="mt-2 inline-block rounded-full bg-secondary/20 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {t.categoryName}
              </span>
            )}
            {!t.categoryName && (
              <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                Global
              </span>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(t)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(t)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {tags?.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No tags found.</p>
        )}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit tag" : "Add tag"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tag name</Label>
              <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                placeholder={generateSlug(form.name || "")}
                onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">URL-friendly identifier. Auto-generated from name if left empty.</p>
            </div>
            <div>
              <Label>Category (optional)</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.categoryId ?? ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Global (all categories)</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id!}>{c.name}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">Leave empty for a global tag usable across all categories.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add tag"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteTag.mutateAsync(confirmDelete.id!);
                toast("Tag deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
