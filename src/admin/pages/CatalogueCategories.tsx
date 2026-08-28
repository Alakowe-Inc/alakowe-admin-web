import { useState } from "react";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
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
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/api/admin/admin.hooks";
import type { CategoryResponse } from "@/lib/api/types";
import { toast } from "react-toastify";

interface CategoryForm {
  name: string;
  slug: string;
}

const emptyForm: CategoryForm = { name: "", slug: "" };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CatalogueCategories() {
  const { data: categories, isLoading } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<CategoryResponse | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const resetForm = () => { setForm(emptyForm); setSlugTouched(false); };
  const startCreate = () => { resetForm(); setCreating(true); };
  const startEdit = (c: CategoryResponse) => {
    setForm({ name: c.name ?? "", slug: c.slug ?? "" });
    setSlugTouched(true);
    setEditing(c);
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
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, name: form.name, slug: form.slug || undefined });
        toast("Category updated");
        setEditing(null);
      } else {
        await createCategory.mutateAsync({ name: form.name, slug: form.slug || undefined });
        toast("Category created");
        setCreating(false);
      }
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading categories...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage book categories and URL slugs.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((c) => (
          <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{c.name}</p>
                  {c.slug && <p className="font-mono text-[10px] text-muted-foreground">/{c.slug}</p>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(c)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(c)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {categories?.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No categories found.</p>
        )}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category name</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteCategory.mutateAsync(confirmDelete.id!);
                toast("Category deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
