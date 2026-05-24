import { useState } from "react";
import { Plus, Edit, EyeOff, Eye, Trash2, MapPin, Phone, Clock, User } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/admin/store/adminStore";
import type { DropoffCentre } from "@/lib/mock-data";
import { toast } from "react-toastify";

const empty: Omit<DropoffCentre, "id"> = {
  name: "", address: "", phone: "", hours: "", contactPerson: "", active: true,
};

export default function DropoffCentres() {
  const centres = useAdminStore((s) => s.dropoffCentres);
  const addCentre = useAdminStore((s) => s.addCentre);
  const updateCentre = useAdminStore((s) => s.updateCentre);
  const toggleHidden = useAdminStore((s) => s.toggleCentreHidden);
  const deleteCentre = useAdminStore((s) => s.deleteCentre);

  const [editing, setEditing] = useState<DropoffCentre | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<DropoffCentre, "id">>(empty);
  const [confirmDelete, setConfirmDelete] = useState<DropoffCentre | null>(null);

  const startCreate = () => { setForm(empty); setCreating(true); };
  const startEdit = (c: DropoffCentre) => { setForm(c); setEditing(c); };

  const submit = () => {
    if (!form.name.trim()) { toast("Name required"); return; }
    if (editing) {
      updateCentre(editing.id, form);
      toast("Centre updated");
      setEditing(null);
    } else {
      addCentre(form);
      toast("Centre added");
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Drop-off Centres</h1>
          <p className="text-sm text-muted-foreground">Partner locations where sellers drop their books.</p>
        </div>
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Centre</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {centres.map((c) => (
          <article key={c.id} className={`rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant ${c.hidden ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold text-foreground">{c.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{c.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                c.active ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-border"
              }`}>{c.active ? "Active" : "Inactive"}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.address}</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone}</li>
              <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {c.hours}</li>
              <li className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> {c.contactPerson}</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(c)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { toggleHidden(c.id); toast(c.hidden ? "Centre shown" : "Centre hidden"); }}>
                {c.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {c.hidden ? "Show" : "Hide"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(c)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit centre" : "Add drop-off centre"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Centre name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Operating hours</Label><Input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
            </div>
            <div><Label>Contact person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add centre"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete centre?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDelete) { deleteCentre(confirmDelete.id); toast("Centre deleted"); setConfirmDelete(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
