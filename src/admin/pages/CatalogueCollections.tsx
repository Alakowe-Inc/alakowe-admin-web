import { useState } from "react";
import { Plus, Edit, Trash2, LayoutList, Search, Check } from "lucide-react";
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
  useAllCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useAssignListingsToCollection,
  useAdminListings,
} from "@/lib/api/admin/admin.hooks";
import type { CollectionResponse, ListingResponse } from "@/lib/api/types";
import { toast } from "react-toastify";

interface CollectionForm {
  name: string;
  slug: string;
  description: string;
}

const emptyForm: CollectionForm = { name: "", slug: "", description: "" };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CatalogueCollections() {
  const { data: collections, isLoading } = useAllCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const assignListings = useAssignListingsToCollection();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CollectionResponse | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<CollectionResponse | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Add listings state
  const [addingToList, setAddingToList] = useState<CollectionResponse | null>(null);
  const [selectedListingIds, setSelectedListingIds] = useState<Set<number>>(new Set());
  const [listingSearch, setListingSearch] = useState("");

  const { data: listingsData } = useAdminListings({
    PageSize: 100,
    Title: listingSearch || undefined,
  });
  const listings = listingsData?.result ?? [];

  const resetForm = () => { setForm(emptyForm); setSlugTouched(false); };
  const startCreate = () => { resetForm(); setCreating(true); };
  const startEdit = (c: CollectionResponse) => {
    setForm({ name: c.name ?? "", slug: c.slug ?? "", description: c.description ?? "" });
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
      const body = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
      };
      if (editing) {
        await updateCollection.mutateAsync({ id: editing.id, ...body });
        toast("Collection updated");
        setEditing(null);
      } else {
        await createCollection.mutateAsync(body);
        toast("Collection created");
        setCreating(false);
      }
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  const openAddListings = (c: CollectionResponse) => {
    setAddingToList(c);
    setSelectedListingIds(new Set());
    setListingSearch("");
  };

  const toggleListing = (id: number) => {
    setSelectedListingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitAssignListings = async () => {
    if (!addingToList || selectedListingIds.size === 0) return;
    try {
      await assignListings.mutateAsync({
        collectionId: addingToList.id,
        listings: Array.from(selectedListingIds).map((id) => ({ listingId: id })),
      });
      toast(`${selectedListingIds.size} listing(s) added to collection`);
      setAddingToList(null);
    } catch { /* toast handled by interceptor */ }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading collections...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground">Curate listing collections and priorities.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Collection</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections?.map((c) => (
          <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LayoutList className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{c.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">/{c.slug}</p>
                </div>
              </div>
              {c.isActive && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Active</span>
              )}
            </div>
            {c.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="default" className="h-8 gap-1" onClick={() => openAddListings(c)}>
                <Plus className="h-3.5 w-3.5" /> Add Listings
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(c)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(c)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {collections?.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No collections found.</p>
        )}
      </div>

      {/* Create / Edit Collection Dialog */}
      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit collection" : "Add collection"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Collection name</Label>
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
              <Label>Description</Label>
              <textarea
                className="mt-1 flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description for this collection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add collection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Listings Dialog */}
      <Dialog open={!!addingToList} onOpenChange={(o) => { if (!o) setAddingToList(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add listings to "{addingToList?.name}"</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search listings by title..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 min-h-[200px] max-h-[400px]">
            {listings.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No listings found.</p>
            )}
            {listings.map((l) => {
              const selected = selectedListingIds.has(l.id!);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleListing(l.id!)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  }`}>
                    {selected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{l.author} &middot; {l.categoryName}</p>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-muted-foreground">
                    {l.price ? `₦${l.price.toLocaleString()}` : "—"}
                  </p>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingToList(null)}>Cancel</Button>
            <Button onClick={submitAssignListings} disabled={selectedListingIds.size === 0}>
              Add {selectedListingIds.size > 0 ? `${selectedListingIds.size} ` : ""}listing(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteCollection.mutateAsync(confirmDelete.id!);
                toast("Collection deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
