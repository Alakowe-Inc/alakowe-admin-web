import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Check, ShieldCheck, FolderOpen, ArrowUpDown, Coins, Users as UsersIcon, Save, GripVertical } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/admin/store/adminStore";
import type { AdminMember } from "@/lib/mock-data";
import { toast } from "react-toastify";

const ROLES: AdminMember["role"][] = ["Super Admin", "Admin", "Moderator", "Support"];
const empty = { name: "", email: "", avatar: "", role: "Admin" as AdminMember["role"], permissions: [] as string[], active: true };

export default function Settings() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your admin team, collections, priorities and platform charges.</p>
      </div>

      <Tabs defaultValue="admins">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/40 p-1 sm:w-fit sm:grid-cols-4">
          <TabsTrigger value="admins" className="gap-1.5"><UsersIcon className="h-3.5 w-3.5" /> Admins</TabsTrigger>
          <TabsTrigger value="collections" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> Collections</TabsTrigger>
          <TabsTrigger value="priorities" className="gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" /> Priorities</TabsTrigger>
          <TabsTrigger value="charges" className="gap-1.5"><Coins className="h-3.5 w-3.5" /> Charges</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="mt-5"><AdminsPanel /></TabsContent>
        <TabsContent value="collections" className="mt-5"><CollectionsPanel /></TabsContent>
        <TabsContent value="priorities" className="mt-5"><PrioritiesPanel /></TabsContent>
        <TabsContent value="charges" className="mt-5"><ChargesPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ───────── Admins ───────── */
function AdminsPanel() {
  const admins = useAdminStore((s) => s.admins);
  const addAdmin = useAdminStore((s) => s.addAdmin);
  const updateAdmin = useAdminStore((s) => s.updateAdmin);
  const removeAdmin = useAdminStore((s) => s.removeAdmin);
  const toggleActive = useAdminStore((s) => s.toggleAdminActive);

  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<AdminMember | null>(null);

  const startCreate = () => { setForm(empty); setCreating(true); };
  const startEdit = (a: AdminMember) => {
    setForm({ name: a.name, email: a.email, avatar: a.avatar, role: a.role, permissions: a.permissions, active: a.active });
    setEditing(a);
  };
  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) { toast("Name and email required"); return; }
    const avatar = form.avatar || form.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
    if (editing) { updateAdmin(editing.id, { ...form, avatar }); toast("Admin updated"); setEditing(null); }
    else { addAdmin({ ...form, avatar }); toast("Admin added"); setCreating(false); }
  };

  return (
    <>
      <PageCard
        title="Admin Management"
        description="Add, remove and assign roles for your admin team."
        action={<Button size="sm" onClick={startCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add Admin</Button>}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-border/40 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-secondary text-xs font-semibold text-primary">{a.avatar}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <ShieldCheck className="h-3 w-3" /> {a.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{a.permissions.join(", ")}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(a.lastLogin).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(a.id)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset transition-all ${
                      a.active ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-border"
                    }`}>{a.active ? "Active" : "Inactive"}</button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(a)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { toggleActive(a.id); toast(a.active ? "Deactivated" : "Activated"); }}>
                          <Check className="mr-2 h-4 w-4" /> {a.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirm(a)}><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit admin" : "Add admin"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminMember["role"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Permissions (comma-separated)</Label><Input value={form.permissions.join(", ")} onChange={(e) => setForm({ ...form, permissions: e.target.value.split(",").map((p) => p.trim()).filter(Boolean) })} placeholder="users, listings, orders" /></div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Add admin"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin?</AlertDialogTitle>
            <AlertDialogDescription>This will revoke {confirm?.name}'s access immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirm) { removeAdmin(confirm.id); toast("Admin removed"); setConfirm(null); } }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ───────── Collections ───────── */
type Collection = {
  id: string; title: string; description: string;
  bgColor: string; btnColor: string; textColor: string;
  rows: number; products: string[]; horizontal: boolean; fullWidth: boolean; visible: boolean;
};
const COL_KEY = "alakowe.admin.collections";
const emptyCol: Omit<Collection, "id"> = {
  title: "", description: "", bgColor: "#0F172A", btnColor: "#6366F1", textColor: "#F8FAFC",
  rows: 1, products: [], horizontal: true, fullWidth: false, visible: true,
};
const seedCollections: Collection[] = [
  { id: "C-1", title: "Editor's Picks", description: "Hand-curated must-reads from the team.", bgColor: "#1E1B4B", btnColor: "#A78BFA", textColor: "#F8FAFC", rows: 1, products: ["BK-5500", "BK-5501", "BK-5502"], horizontal: true, fullWidth: true, visible: true },
  { id: "C-2", title: "African Classics", description: "Timeless stories from the continent.", bgColor: "#7C2D12", btnColor: "#FB923C", textColor: "#FEF3C7", rows: 2, products: ["BK-5503", "BK-5504"], horizontal: false, fullWidth: false, visible: true },
];

function CollectionsPanel() {
  const listings = useAdminStore((s) => s.listings);
  const [items, setItems] = useState<Collection[]>(() => {
    try { const raw = localStorage.getItem(COL_KEY); return raw ? JSON.parse(raw) : seedCollections; } catch { return seedCollections; }
  });
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Collection, "id">>(emptyCol);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => { try { localStorage.setItem(COL_KEY, JSON.stringify(items)); } catch { /* noop */ } }, [items]);

  const filteredProducts = useMemo(() => listings.filter((l) =>
    !productSearch || l.title.toLowerCase().includes(productSearch.toLowerCase())
  ), [listings, productSearch]);

  const start = (c?: Collection) => {
    if (c) { setForm({ ...c }); setEditing(c); } else { setForm(emptyCol); setCreating(true); }
    setProductSearch("");
  };
  const submit = () => {
    if (!form.title.trim()) { toast("Title required"); return; }
    if (editing) { setItems(items.map((i) => i.id === editing.id ? { ...editing, ...form } : i)); toast("Collection updated"); setEditing(null); }
    else { setItems([...items, { ...form, id: `C-${Date.now()}` }]); toast("Collection created"); setCreating(false); }
  };
  const remove = (id: string) => { setItems(items.filter((i) => i.id !== id)); toast("Collection deleted"); };
  const toggle = (id: string) => setItems(items.map((i) => i.id === id ? { ...i, visible: !i.visible } : i));
  const toggleProduct = (pid: string) => setForm({ ...form, products: form.products.includes(pid) ? form.products.filter((x) => x !== pid) : [...form.products, pid] });

  return (
    <>
      <PageCard
        title="Product Collections"
        description="Curated groupings shown on the storefront."
        action={<Button size="sm" onClick={() => start()} className="gap-1.5"><Plus className="h-4 w-4" /> New Collection</Button>}
      >
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">No collections yet — create your first one.</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg shadow-soft" style={{ background: c.bgColor }} />
                  <div>
                    <p className="font-semibold text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.products.length} product{c.products.length === 1 ? "" : "s"} · {c.rows} row{c.rows === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(c.id)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                    c.visible ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-border"
                  }`}>{c.visible ? "Visible" : "Hidden"}</button>
                  <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => start(c)}><Edit className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageCard>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit collection" : "New collection"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Background</Label><Input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} className="h-10 p-1" /></div>
            <div><Label>Button</Label><Input type="color" value={form.btnColor} onChange={(e) => setForm({ ...form, btnColor: e.target.value })} className="h-10 p-1" /></div>
            <div><Label>Text</Label><Input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} className="h-10 p-1" /></div>
            <div><Label>Rows</Label><Input type="number" min={1} max={5} value={form.rows} onChange={(e) => setForm({ ...form, rows: +e.target.value || 1 })} /></div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2"><Label>Horizontal scroll</Label><Switch checked={form.horizontal} onCheckedChange={(v) => setForm({ ...form, horizontal: v })} /></div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2"><Label>Full width</Label><Switch checked={form.fullWidth} onCheckedChange={(v) => setForm({ ...form, fullWidth: v })} /></div>
            <div className="sm:col-span-2">
              <Label>Products ({form.products.length} selected)</Label>
              <Input placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="mt-1" />
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/30 p-2">
                {filteredProducts.map((l) => {
                  const checked = form.products.includes(l.id);
                  return (
                    <button key={l.id} type="button" onClick={() => toggleProduct(l.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-all ${
                        checked ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}>
                      <span><span className="font-mono text-[10px] mr-2 text-muted-foreground">{l.id}</span>{l.title}</span>
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ───────── Priorities ───────── */
const PRI_KEY = "alakowe.admin.priorities";
function PrioritiesPanel() {
  const listings = useAdminStore((s) => s.listings);
  const [pri, setPri] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(PRI_KEY) || "{}"); } catch { return {}; }
  });
  useEffect(() => { try { localStorage.setItem(PRI_KEY, JSON.stringify(pri)); } catch { /* noop */ } }, [pri]);

  const sorted = useMemo(() =>
    [...listings].sort((a, b) => (pri[b.id] ?? 0) - (pri[a.id] ?? 0)),
    [listings, pri]
  );

  const set = (id: string, n: number) => setPri({ ...pri, [id]: n });
  const move = (id: string, dir: -1 | 1) => set(id, (pri[id] ?? 0) + dir);

  return (
    <PageCard title="Product Priorities" description="Higher priority numbers surface products first across the storefront." bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-4 py-3"></th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Seller</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Priority</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr key={l.id} className="border-b border-border/40 hover:bg-muted/40">
                <td className="px-4 py-3 text-muted-foreground"><GripVertical className="h-4 w-4 cursor-grab" /></td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-foreground">{l.title}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{l.id}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{l.seller}</td>
                <td className="px-5 py-3 text-muted-foreground">{l.status}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => move(l.id, -1)}>−</Button>
                    <Input type="number" value={pri[l.id] ?? 0} onChange={(e) => set(l.id, +e.target.value || 0)} className="h-8 w-16 text-center" />
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => move(l.id, 1)}>+</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageCard>
  );
}

/* ───────── Platform Charges ───────── */
const CHG_KEY = "alakowe.admin.charges";
type Charges = { listingMarkup: number; sellerDeduction: number; platformFee: number; delivery: number; pickup: number; interstate: number };
const defaultCharges: Charges = { listingMarkup: 15, sellerDeduction: 15, platformFee: 5, delivery: 1500, pickup: 1000, interstate: 3500 };

function ChargesPanel() {
  const [c, setC] = useState<Charges>(() => {
    try { return { ...defaultCharges, ...JSON.parse(localStorage.getItem(CHG_KEY) || "{}") }; } catch { return defaultCharges; }
  });
  const save = () => { try { localStorage.setItem(CHG_KEY, JSON.stringify(c)); } catch { /* noop */ } toast("Charges saved"); };

  const fields: { key: keyof Charges; label: string; help: string; suffix: string }[] = [
    { key: "listingMarkup", label: "Listing Markup Fee", help: "Added on top of seller's price to compute the listing price.", suffix: "%" },
    { key: "sellerDeduction", label: "Seller Deduction Fee", help: "Deducted from the seller's price as the platform's cut.", suffix: "%" },
    { key: "platformFee", label: "Platform Fee", help: "General platform service fee for each transaction.", suffix: "%" },
    { key: "delivery", label: "Delivery Charges", help: "Standard delivery cost charged to the buyer.", suffix: "₦" },
    { key: "pickup", label: "Pickup Charges", help: "Cost charged when sellers request a pickup.", suffix: "₦" },
    { key: "interstate", label: "Interstate Delivery", help: "Cost for deliveries outside the seller's state.", suffix: "₦" },
  ];

  return (
    <PageCard
      title="Platform Charges"
      description="Configure marketplace fees and delivery rates."
      action={<Button size="sm" onClick={save} className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <Label className="text-sm font-semibold">{f.label}</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input type="number" min={0} value={c[f.key]} onChange={(e) => setC({ ...c, [f.key]: +e.target.value || 0 })} className="h-10" />
              <span className="text-sm font-semibold text-muted-foreground">{f.suffix}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{f.help}</p>
          </div>
        ))}
      </div>
    </PageCard>
  );
}
