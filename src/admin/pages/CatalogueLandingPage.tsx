import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useLandingPage,
  useCreateLandingPageSection,
  useUpdateLandingPageSection,
  useDeleteLandingPageSection,
  useAllCategories,
  useAllCollections,
  useAllTags,
} from "@/lib/api/admin/admin.hooks";
import type { LandingPageSectionType } from "@/lib/api/types";
import { toast } from "react-toastify";

interface SectionForm {
  sectionType: LandingPageSectionType;
  referenceId: number;
  displayOrder: number;
  titleOverride: string;
}

const emptyForm: SectionForm = { sectionType: "Category", referenceId: 0, displayOrder: 0, titleOverride: "" };

const sectionTypeColors: Record<string, string> = {
  category: "bg-blue-100 text-blue-700",
  collection: "bg-green-100 text-green-700",
  tag: "bg-purple-100 text-purple-700",
};

export default function CatalogueLandingPage() {
  const { data: landingPage, isLoading } = useLandingPage();
  const createSection = useCreateLandingPageSection();
  const updateSection = useUpdateLandingPageSection();
  const deleteSection = useDeleteLandingPageSection();

  const { data: categories } = useAllCategories();
  const { data: collections } = useAllCollections();
  const { data: tags } = useAllTags();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: number; displayOrder: number; titleOverride: string } | null>(null);
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);

  const sections = useMemo(() => {
    const raw = (landingPage as any)?.data?.sections ?? landingPage?.sections ?? [];
    return [...raw].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [landingPage]);

  const resetForm = () => setForm(emptyForm);
  const startCreate = () => { resetForm(); setForm((prev) => ({ ...prev, displayOrder: sections.length })); setCreating(true); };
  const startEdit = (s: any) => {
    setEditing({ id: s.id, displayOrder: s.displayOrder ?? 0, titleOverride: s.title ?? "" });
  };

  const getReferenceOptions = () => {
    switch (form.sectionType) {
      case "Category": return categories ?? [];
      case "Collection": return collections ?? [];
      case "Tag": return tags ?? [];
      default: return [];
    }
  };

  const getReferenceLabel = (sectionType: string, filterParam: any): string => {
    if (!filterParam) return "—";
    const slug = filterParam.category || filterParam.collection || filterParam.tag || "";
    const list = sectionType === "Category" ? categories : sectionType === "Collection" ? collections : tags;
    const match = list?.find((r: any) => r.slug === slug);
    return match?.name ?? slug;
  };

  const submitCreate = async () => {
    if (!form.referenceId) { toast("Select a reference entity"); return; }
    try {
      await createSection.mutateAsync({
        sectionType: form.sectionType,
        referenceId: form.referenceId,
        displayOrder: form.displayOrder,
        titleOverride: form.titleOverride || undefined,
      });
      toast("Section added");
      setCreating(false);
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  const submitEdit = async () => {
    if (!editing) return;
    try {
      await updateSection.mutateAsync({
        id: editing.id,
        displayOrder: editing.displayOrder,
        titleOverride: editing.titleOverride || undefined,
      });
      toast("Section updated");
      setEditing(null);
    } catch { /* toast handled by interceptor */ }
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const current = sections[index];
    const target = sections[targetIndex];

    try {
      await updateSection.mutateAsync({ id: current.id, displayOrder: target.displayOrder ?? targetIndex });
      await updateSection.mutateAsync({ id: target.id, displayOrder: current.displayOrder ?? index });
      toast("Section order updated");
    } catch { /* toast handled by interceptor */ }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading landing page...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Landing Page</h1>
        <p className="text-sm text-muted-foreground">Configure homepage section layout and ordering.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Section</Button>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">No sections configured. Add a section to get started.</p>
      )}

      <div className="space-y-3">
        {sections.map((section: any, index: number) => {
          const typeLower = (section.sectionType ?? "").toLowerCase();
          return (
            <article key={section.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elegant">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-bold text-sm">
                {(section.displayOrder ?? index) + 1}
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutDashboard className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-bold text-foreground truncate">{section.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${sectionTypeColors[typeLower] ?? "bg-muted text-muted-foreground"}`}>
                    {section.sectionType}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {getReferenceLabel(section.sectionType, section.filterParam)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={index === 0}
                  onClick={() => moveSection(index, "up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, "down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => startEdit(section)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete({ id: section.id, title: section.title })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Create Section Dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) { setCreating(false); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add section</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Section type</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.sectionType}
                onChange={(e) => setForm({ ...form, sectionType: e.target.value as LandingPageSectionType, referenceId: 0 })}
              >
                <option value="Category">Category</option>
                <option value="Collection">Collection</option>
                <option value="Tag">Tag</option>
              </select>
            </div>
            <div>
              <Label>{form.sectionType}</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.referenceId}
                onChange={(e) => setForm({ ...form, referenceId: Number(e.target.value) })}
              >
                <option value={0}>Select a {form.sectionType.toLowerCase()}</option>
                {getReferenceOptions().map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Display order</Label>
              <Input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Position in the landing page (0 = first).</p>
            </div>
            <div>
              <Label>Title override (optional)</Label>
              <Input
                value={form.titleOverride}
                onChange={(e) => setForm({ ...form, titleOverride: e.target.value })}
                placeholder="Custom display title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); resetForm(); }}>Cancel</Button>
            <Button onClick={submitCreate}>Add section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit section</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Display order</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.displayOrder}
                  onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Title override</Label>
                <Input
                  value={editing.titleOverride}
                  onChange={(e) => setEditing({ ...editing, titleOverride: e.target.value })}
                  placeholder="Custom display title"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submitEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the "{confirmDelete?.title}" section from the landing page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteSection.mutateAsync(confirmDelete.id);
                toast("Section deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
