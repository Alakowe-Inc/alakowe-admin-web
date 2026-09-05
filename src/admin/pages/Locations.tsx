import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAllStates,
  useCreateState,
  useUpdateState,
  useDeleteState,
  useAreasByState,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from "@/lib/api/admin/admin.hooks";
import type { StateResponse, AreaResponse } from "@/lib/api/types";
import { toast } from "react-toastify";

interface StateForm {
  name: string;
}
interface AreaForm {
  stateId: number;
  name: string;
}

const emptyStateForm: StateForm = { name: "" };
const emptyAreaForm: AreaForm = { stateId: 0, name: "" };

export default function Locations() {
  const [tab, setTab] = useState("states");

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Locations</h1>
        <p className="text-sm text-muted-foreground">Manage states and areas for the marketplace.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="states" className="gap-2"><Building2 className="h-4 w-4" /> States</TabsTrigger>
          <TabsTrigger value="areas" className="gap-2"><MapPin className="h-4 w-4" /> Areas</TabsTrigger>
        </TabsList>
        <TabsContent value="states" className="mt-4">
          <StatesTab />
        </TabsContent>
        <TabsContent value="areas" className="mt-4">
          <AreasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatesTab() {
  const { data: states, isLoading } = useAllStates();
  const createState = useCreateState();
  const updateState = useUpdateState();
  const deleteState = useDeleteState();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StateResponse | null>(null);
  const [form, setForm] = useState<StateForm>(emptyStateForm);
  const [confirmDelete, setConfirmDelete] = useState<StateResponse | null>(null);

  const resetForm = () => setForm(emptyStateForm);
  const startCreate = () => { resetForm(); setCreating(true); };
  const startEdit = (s: StateResponse) => { setForm({ name: s.name ?? "" }); setEditing(s); };

  const submit = async () => {
    if (!form.name.trim()) { toast("Name required"); return; }
    try {
      if (editing) {
        await updateState.mutateAsync({ id: editing.id, name: form.name });
        toast("State updated");
        setEditing(null);
      } else {
        await createState.mutateAsync({ name: form.name });
        toast("State created");
        setCreating(false);
      }
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading states...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add State</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {states?.map((s) => (
          <article key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{s.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">ID: {s.id}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(s)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(s)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit state" : "Add state"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>State name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add state"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete state?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteState.mutateAsync(confirmDelete.id!);
                toast("State deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AreasTab() {
  const { data: states } = useAllStates();
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AreaResponse | null>(null);
  const [form, setForm] = useState<AreaForm>(emptyAreaForm);
  const [confirmDelete, setConfirmDelete] = useState<AreaResponse | null>(null);

  const { data: areas, isLoading } = useAreasByState(selectedStateId);

  const resetForm = () => setForm(emptyAreaForm);
  const startCreate = () => { setForm({ stateId: selectedStateId, name: "" }); setCreating(true); };
  const startEdit = (a: AreaResponse) => { setForm({ stateId: a.stateId ?? 0, name: a.name ?? "" }); setEditing(a); };

  const submit = async () => {
    if (!form.name.trim()) { toast("Name required"); return; }
    if (!form.stateId) { toast("Select a state"); return; }
    try {
      if (editing) {
        await updateArea.mutateAsync({ id: editing.id, stateId: form.stateId, name: form.name });
        toast("Area updated");
        setEditing(null);
      } else {
        await createArea.mutateAsync({ stateId: form.stateId, name: form.name });
        toast("Area created");
        setCreating(false);
      }
      resetForm();
    } catch { /* toast handled by interceptor */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-3">
          <div>
            <Label>Filter by state</Label>
            <select
              className="mt-1 flex h-10 w-60 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedStateId}
              onChange={(e) => { setSelectedStateId(Number(e.target.value)); setEditing(null); setCreating(false); }}
            >
              <option value={0}>Select a state</option>
              {states?.map((s) => (
                <option key={s.id} value={s.id!}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedStateId > 0 && (
          <Button onClick={startCreate} className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add Area</Button>
        )}
      </div>

      {!selectedStateId && (
        <p className="text-sm text-muted-foreground">Select a state above to manage its areas.</p>
      )}

      {isLoading && <div className="text-sm text-muted-foreground">Loading areas...</div>}

      {selectedStateId > 0 && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas?.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">{a.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">ID: {a.id}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(a)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(a)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))}
          {areas?.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No areas found for this state.</p>
          )}
        </div>
      )}

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit area" : "Add area"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>State</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.stateId}
                onChange={(e) => setForm({ ...form, stateId: Number(e.target.value) })}
              >
                <option value={0}>Select a state</option>
                {states?.map((s) => (
                  <option key={s.id} value={s.id!}>{s.name}</option>
                ))}
              </select>
            </div>
            <div><Label>Area name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add area"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete area?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {confirmDelete?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!confirmDelete) return;
              try {
                await deleteArea.mutateAsync(confirmDelete.id!);
                toast("Area deleted");
                setConfirmDelete(null);
              } catch { /* toast handled by interceptor */ }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
