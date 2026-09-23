import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Save, TicketPercent } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAllVouchers,
  useCreateVoucher,
  useDeleteVoucher,
  useUpdateVoucher,
} from "@/lib/api/admin/admin.hooks";
import type {
  CreateVoucherRequestDto,
  UpdateVoucherRequestDto,
  VoucherResponse,
} from "@/lib/api/types";
import { toast } from "react-toastify";

const toKobo = (naira: string): number | null => {
  if (naira === "") return null;
  const n = Number(naira);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
};

const fromKobo = (kobo?: number | null): string =>
  kobo == null ? "" : String(kobo / 100);

const emptyForm = {
  code: "",
  description: "",
  discountPercent: "10",
  amountCap: "",
  minOrderAmount: "",
  maxUses: "",
  perUserLimit: "1",
  validFrom: new Date().toISOString().slice(0, 16),
  validTo: "",
  isActive: true,
};

type FormState = typeof emptyForm;

function toCreatePayload(form: FormState): CreateVoucherRequestDto {
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || null,
    discountPercent: Number(form.discountPercent) || 0,
    amountCap: toKobo(form.amountCap),
    minOrderAmount: toKobo(form.minOrderAmount),
    maxUses: form.maxUses === "" ? null : Number(form.maxUses),
    perUserLimit: form.perUserLimit === "" ? null : Number(form.perUserLimit),
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : new Date().toISOString(),
    validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
    isActive: form.isActive,
  };
}

function toUpdatePayload(id: number, form: FormState): UpdateVoucherRequestDto {
  return { id, ...toCreatePayload(form) };
}

function toForm(v: VoucherResponse): FormState {
  return {
    code: v.code ?? "",
    description: v.description ?? "",
    discountPercent: String(v.discountPercent ?? 0),
    amountCap: fromKobo(v.amountCap),
    minOrderAmount: fromKobo(v.minOrderAmount),
    maxUses: v.maxUses == null ? "" : String(v.maxUses),
    perUserLimit: v.perUserLimit == null ? "" : String(v.perUserLimit),
    validFrom: v.validFrom ? new Date(v.validFrom).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    validTo: v.validTo ? new Date(v.validTo).toISOString().slice(0, 16) : "",
    isActive: !!v.isActive,
  };
}

export default function Vouchers() {
  const { data: all, isLoading, refetch } = useAllVouchers();

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, validFrom: new Date().toISOString().slice(0, 16) });
    setOpen(true);
  };

  const startEdit = (v: VoucherResponse) => {
    setEditing(v);
    setForm(toForm(v));
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setForm({ ...emptyForm, validFrom: new Date().toISOString().slice(0, 16) });
  };

  const canSave = useMemo(() => {
    const pct = Number(form.discountPercent);
    return form.code.trim().length > 0 && pct >= 1 && pct <= 100;
  }, [form]);

  const submit = async () => {
    if (!canSave) {
      toast("Enter a code and a discount between 1 and 100.");
      return;
    }
    try {
      if (editing?.id) {
        await updateMutation.mutateAsync(toUpdatePayload(editing.id, form));
        toast("Voucher updated");
      } else {
        await createMutation.mutateAsync(toCreatePayload(form));
        toast("Voucher created — share the code with users");
      }
      closeDialog();
      refetch();
    } catch {
      toast("Failed to save voucher");
    }
  };

  const list = all ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Vouchers</h1>
        <p className="text-sm text-muted-foreground">
          Create percentage-off vouchers with an amount cap. Vouchers reduce what the buyer pays;
          seller payouts are not affected — the platform absorbs the discount.
        </p>
      </div>

      <PageCard
        title="All Vouchers"
        description="Share a voucher code with users. They enter it at checkout."
        action={
          <Button size="sm" onClick={startCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Voucher
          </Button>
        }
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No vouchers yet. Create one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Validity</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="border-b border-border/40 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-semibold">
                        <TicketPercent className="h-4 w-4 text-muted-foreground" />
                        {v.code}
                      </div>
                      {v.description && (
                        <div className="mt-1 text-xs text-muted-foreground">{v.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{v.discountPercent ?? 0}%</span>
                        {" "}off · Cap:{" "}
                        <span className="font-semibold text-foreground">
                          {v.amountCap != null ? `₦${(v.amountCap / 100).toLocaleString()}` : "—"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Min order:{" "}
                        <span className="font-semibold text-foreground">
                          {v.minOrderAmount != null ? `₦${(v.minOrderAmount / 100).toLocaleString()}` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-medium text-muted-foreground">
                        From: {v.validFrom ? new Date(v.validFrom).toLocaleDateString() : "—"}
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        To: {v.validTo ? new Date(v.validTo).toLocaleDateString() : "No expiry"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-semibold">
                        {v.usageCount ?? 0}{v.maxUses != null ? ` / ${v.maxUses}` : ""} used
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Per user: {v.perUserLimit ?? "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-semibold">
                        {v.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          onClick={() => startEdit(v)}
                          disabled={!v.id}
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (!v.id) return;
                            try {
                              await deleteMutation.mutateAsync(v.id);
                              toast("Voucher deleted");
                              refetch();
                            } catch {
                              toast("Failed to delete");
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete voucher"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      <Dialog open={open} onOpenChange={(o) => (o ? null : closeDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Voucher" : "New Voucher"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Voucher Code</Label>
              <Input
                value={form.code}
                placeholder="e.g. WELCOME10"
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <Label>Discount Percent (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.discountPercent}
                onChange={(e) => setForm((s) => ({ ...s, discountPercent: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description (optional, admin only)</Label>
              <Input
                value={form.description}
                placeholder="e.g. Welcome discount for new users"
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Amount Cap ₦ (max discount, optional)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 2000"
                value={form.amountCap}
                onChange={(e) => setForm((s) => ({ ...s, amountCap: e.target.value }))}
              />
            </div>
            <div>
              <Label>Min Order ₦ (optional)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5000"
                value={form.minOrderAmount}
                onChange={(e) => setForm((s) => ({ ...s, minOrderAmount: e.target.value }))}
              />
            </div>

            <div>
              <Label>Max Uses (optional, blank = unlimited)</Label>
              <Input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm((s) => ({ ...s, maxUses: e.target.value }))}
              />
            </div>
            <div>
              <Label>Uses Per User (optional)</Label>
              <Input
                type="number"
                min={1}
                value={form.perUserLimit}
                onChange={(e) => setForm((s) => ({ ...s, perUserLimit: e.target.value }))}
              />
            </div>

            <div>
              <Label>Valid From</Label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm((s) => ({ ...s, validFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label>Valid To (optional)</Label>
              <Input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({ ...s, validTo: v }));
                }}
              />
            </div>

            <div className="sm:col-span-2 rounded-xl border border-border/60 bg-muted/30 p-4">
              <Label className="text-sm font-semibold">Is Active</Label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  Only active vouchers within their validity window can be used at checkout.
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              className="gap-1.5"
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
