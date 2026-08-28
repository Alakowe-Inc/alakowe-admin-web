import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Save } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useActivePlatformFeeConfig,
  useAllPlatformFeeConfigs,
  useCreatePlatformFeeConfig,
  useDeletePlatformFeeConfig,
  useUpdatePlatformFeeConfig,
} from "@/lib/api/admin/admin.hooks";
import type {
  CreatePlatformFeeConfigRequestDto,
  PlatformFeeConfigResponse,
  UpdatePlatformFeeConfigRequestDto,
} from "@/lib/api/types";
import { toast } from "react-toastify";

const emptyPlatform: CreatePlatformFeeConfigRequestDto = {
  markupPercent: 0,
  markupCap: null,
  commissionPercent: 0,
  commissionCap: null,
  isActive: true,
  effectiveFrom: new Date().toISOString(),
  effectiveTo: null,
};

function asUpdatePayload(
  id: number,
  form: CreatePlatformFeeConfigRequestDto,
): UpdatePlatformFeeConfigRequestDto {
  return { id, ...form };
}

export default function ConfigurationPlatformFees() {
  const { data: active, isLoading: isLoadingActive, refetch: refetchActive } = useActivePlatformFeeConfig();
  const { data: all, isLoading: isLoadingAll, refetch } = useAllPlatformFeeConfigs();

  const createMutation = useCreatePlatformFeeConfig();
  const updateMutation = useUpdatePlatformFeeConfig();
  const deleteMutation = useDeletePlatformFeeConfig();

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<PlatformFeeConfigResponse | null>(null);
  const [form, setForm] = useState<CreatePlatformFeeConfigRequestDto>(emptyPlatform);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyPlatform, effectiveFrom: new Date().toISOString() });
    setOpenCreate(true);
  };

  const startEdit = (c: PlatformFeeConfigResponse) => {
    setEditing(c);
    setForm({
      markupPercent: c.markupPercent ?? 0,
      markupCap: c.markupCap ?? null,
      commissionPercent: c.commissionPercent ?? 0,
      commissionCap: c.commissionCap ?? null,
      isActive: c.isActive ?? false,
      effectiveFrom: c.effectiveFrom ?? new Date().toISOString(),
      effectiveTo: c.effectiveTo ?? null,
    });
    setOpenCreate(true);
  };

  const closeDialog = () => {
    setOpenCreate(false);
    setEditing(null);
    setForm({ ...emptyPlatform, effectiveFrom: new Date().toISOString() });
  };

  const canSave = useMemo(() => {
    return (form.markupPercent ?? 0) >= 0 && (form.commissionPercent ?? 0) >= 0;
  }, [form]);

  const submit = async () => {
    if (!canSave) {
      toast("Fix invalid values (percentages).");
      return;
    }
    try {
      if (editing?.id) {
        await updateMutation.mutateAsync(asUpdatePayload(editing.id, form));
        toast("Platform fee configuration updated");
      } else {
        await createMutation.mutateAsync(form);
        toast("Platform fee configuration created");
      }
      closeDialog();
      refetch();
      refetchActive();
    } catch {
      toast("Failed to save platform fee configuration");
    }
  };

  const activeCard = (
    <PageCard
      title="Active Platform Fee"
      description="Currently applied platform fee configuration."
      action={
        <Button size="sm" onClick={startCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Config
        </Button>
      }
    >
      {isLoadingActive ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !active ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No active platform fee configuration found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <Label className="text-sm font-semibold">Markup</Label>
            <div className="mt-2 text-lg font-bold">
              {active.markupPercent ?? 0}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Cap: {active.markupCap ?? "—"}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <Label className="text-sm font-semibold">Commission</Label>
            <div className="mt-2 text-lg font-bold">
              {active.commissionPercent ?? 0}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Cap: {active.commissionCap ?? "—"}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 sm:col-span-2">
            <Label className="text-sm font-semibold">Effective Window</Label>
            <div className="mt-2 text-sm font-medium">
              From: {active.effectiveFrom ? new Date(active.effectiveFrom).toLocaleString() : "—"}
            </div>
            <div className="mt-1 text-sm font-medium text-muted-foreground">
              To: {active.effectiveTo ? new Date(active.effectiveTo).toLocaleString() : "—"}
            </div>
          </div>
        </div>
      )}
    </PageCard>
  );

  const list = all ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Platform Fees</h1>
        <p className="text-sm text-muted-foreground">
          Configure markup/commission rules for platform charges.
        </p>
      </div>

      {activeCard}

      <PageCard
        title="All Platform Fee Configurations"
        description="Manage fee configs history. You can edit or delete non-active configs."
      >
        {isLoadingAll ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No platform fee configurations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Config</th>
                  <th className="px-5 py-3">Effective</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="text-xs text-muted-foreground">
                        Markup: <span className="font-semibold text-foreground">{c.markupPercent ?? 0}%</span>{" "}
                        · Cap: <span className="font-semibold text-foreground">{c.markupCap ?? "—"}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Commission: <span className="font-semibold text-foreground">{c.commissionPercent ?? 0}%</span>{" "}
                        · Cap: <span className="font-semibold text-foreground">{c.commissionCap ?? "—"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="text-xs font-medium text-muted-foreground">
                        {c.effectiveFrom ? new Date(c.effectiveFrom).toLocaleDateString() : "—"}
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        To: {c.effectiveTo ? new Date(c.effectiveTo).toLocaleDateString() : "—"}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="text-xs font-semibold">
                        {c.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          onClick={() => startEdit(c)}
                          disabled={!c.id}
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (!c.id) return;
                            try {
                              await deleteMutation.mutateAsync(c.id);
                              toast("Platform fee configuration deleted");
                              refetch();
                              refetchActive();
                            } catch {
                              toast("Failed to delete");
                            }
                          }}
                          disabled={deleteMutation.isPending || c.isActive}
                          title={c.isActive ? "Active configuration cannot be deleted" : "Delete configuration"}
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

      <Dialog open={openCreate} onOpenChange={(o) => (o ? null : closeDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Platform Fee Config" : "New Platform Fee Config"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Markup Percent</Label>
              <Input
                type="number"
                min={0}
                value={form.markupPercent ?? 0}
                onChange={(e) => setForm((s) => ({ ...s, markupPercent: +e.target.value || 0 }))}
              />
            </div>
            <div>
              <Label>Markup Cap (optional)</Label>
              <Input
                type="number"
                value={form.markupCap ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, markupCap: e.target.value === "" ? null : +e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Commission Percent</Label>
              <Input
                type="number"
                min={0}
                value={form.commissionPercent ?? 0}
                onChange={(e) => setForm((s) => ({ ...s, commissionPercent: +e.target.value || 0 }))}
              />
            </div>
            <div>
              <Label>Commission Cap (optional)</Label>
              <Input
                type="number"
                value={form.commissionCap ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, commissionCap: e.target.value === "" ? null : +e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Effective From</Label>
              <Input
                type="datetime-local"
                value={
                  form.effectiveFrom
                    ? new Date(form.effectiveFrom).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({ ...s, effectiveFrom: v ? new Date(v).toISOString() : s.effectiveFrom }));
                }}
              />
            </div>

            <div>
              <Label>Effective To (optional)</Label>
              <Input
                type="datetime-local"
                value={form.effectiveTo ? new Date(form.effectiveTo).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({ ...s, effectiveTo: v ? new Date(v).toISOString() : null }));
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
                  Mark this configuration as active when saved.
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
