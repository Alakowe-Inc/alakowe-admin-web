import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Save } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAllDeliveryFeeConfigs,
  useCreateDeliveryFeeConfig,
  useDeleteDeliveryFeeConfig,
  useUpdateDeliveryFeeConfig,
  useAllStates,
  useAreasByState,
} from "@/lib/api/admin/admin.hooks";
import type {
  AreaResponse,
  CreateDeliveryFeeConfigurationRequestDto,
  DeliveryFeeConfigurationResponse,
  StateResponse,
  UpdateDeliveryFeeConfigurationRequestDto,
} from "@/lib/api/types";
import { toast } from "react-toastify";

const emptyDelivery: CreateDeliveryFeeConfigurationRequestDto = {
  originStateId: null,
  originAreaId: null,
  destinationStateId: null,
  destinationAreaId: null,
  minWeightGrams: 0,
  maxWeightGrams: 0,
  fee: 0,
  cap: null,
  priority: 1,
};

function asUpdatePayload(id: number, form: CreateDeliveryFeeConfigurationRequestDto): UpdateDeliveryFeeConfigurationRequestDto {
  return { id, ...form };
}

export default function ConfigurationDeliveryFees() {
  const {
    data: configs,
    isLoading,
    refetch,
  } = useAllDeliveryFeeConfigs();

  const createMutation = useCreateDeliveryFeeConfig();
  const updateMutation = useUpdateDeliveryFeeConfig();
  const deleteMutation = useDeleteDeliveryFeeConfig();

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<DeliveryFeeConfigurationResponse | null>(null);
  const [form, setForm] = useState<CreateDeliveryFeeConfigurationRequestDto>(emptyDelivery);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyDelivery });
    setOpenCreate(true);
  };

  const startEdit = (c: DeliveryFeeConfigurationResponse) => {
    setEditing(c);
    setForm({
      originStateId: c.originStateId ?? null,
      originAreaId: c.originAreaId ?? null,
      destinationStateId: c.destinationStateId ?? null,
      destinationAreaId: c.destinationAreaId ?? null,
      minWeightGrams: c.minWeightGrams ?? 0,
      maxWeightGrams: c.maxWeightGrams ?? 0,
      fee: c.fee ?? 0,
      cap: c.cap ?? null,
      priority: c.priority ?? 1,
    });
    setOpenCreate(true);
  };

  const closeDialog = () => {
    setOpenCreate(false);
    setEditing(null);
    setForm({ ...emptyDelivery });
  };

  const { data: states } = useAllStates();
  const { data: originAreas } = useAreasByState(form.originStateId ?? -1);
  const { data: destinationAreas } = useAreasByState(form.destinationStateId ?? -1);

  const canSave = useMemo(() => {
    const minW = form.minWeightGrams ?? 0;
    const maxW = form.maxWeightGrams ?? 0;
    // State/area ids are optional; when not selected, we pass null to the API.
    return minW >= 0 && maxW >= 0 && (form.fee ?? 0) >= 0;
  }, [form]);

  const submit = async () => {
    if (!canSave) {
      toast("Fix invalid values (weights/fee/zones).");
      return;
    }

    try {
      if (editing?.id) {
        form.fee = Math.round(form.fee * 100); // Ensure fee is not null for update
        await updateMutation.mutateAsync(asUpdatePayload(editing.id, form));
        toast("Delivery fee configuration updated");
      } else {
        form.fee = Math.round(form.fee * 100);
        await createMutation.mutateAsync(form);
        toast("Delivery fee configuration created");
      }
      closeDialog();
      refetch();
    } catch {
      toast("Failed to save delivery fee configuration");
    }
  };

  const configsList = configs ?? [];
  const statesList = states ?? [];
  const originAreasList = originAreas ?? [];
  const destinationAreasList = destinationAreas ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Delivery Fees</h1>
        <p className="text-sm text-muted-foreground">
          Configure delivery fee rules by origin/destination zones and weight range.
        </p>
      </div>

      <PageCard
        title="Delivery Fee Configurations"
        description="Create and manage platform delivery fee configurations."
        action={
          <Button size="sm" onClick={startCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Config
          </Button>
        }
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : configsList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No delivery fee configurations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Zones</th>
                  <th className="px-5 py-3">Weight Range</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Cap / Priority</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configsList.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="text-xs font-mono text-muted-foreground">
                        {c.originStateId ?? "-"}:{c.originAreaId ?? "-"} → {c.destinationStateId ?? "-"}:{c.destinationAreaId ?? "-"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-mono text-muted-foreground">
                        {c.minWeightGrams ?? 0}g - {c.maxWeightGrams ?? 0}g
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-foreground">{(c.fee ?? 0)/100}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-muted-foreground">
                        Cap: {c.cap ?? "—"} · Priority: {c.priority ?? 1}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => startEdit(c)}>
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
                              toast("Delivery fee configuration deleted");
                              refetch();
                            } catch {
                              toast("Failed to delete");
                            }
                          }}
                          disabled={deleteMutation.isPending}
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
            <DialogTitle>{editing?.id ? "Edit Delivery Fee Config" : "New Delivery Fee Config"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Origin State</Label>
              <Select
                value={form.originStateId != null ? String(form.originStateId) : ""}
                onValueChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    originStateId: v ? +v : null,
                    originAreaId: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {statesList.map((st: StateResponse) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {st.name ?? `State ${st.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Origin Area</Label>
              <Select
                value={form.originAreaId != null ? String(form.originAreaId) : ""}
                onValueChange={(v) => setForm((s) => ({ ...s, originAreaId: v ? +v : null }))}
                disabled={form.originStateId == null}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {originAreasList.map((a: AreaResponse) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name ?? `Area ${a.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Destination State</Label>
              <Select
                value={form.destinationStateId != null ? String(form.destinationStateId) : ""}
                onValueChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    destinationStateId: v ? +v : null,
                    destinationAreaId: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {statesList.map((st: StateResponse) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {st.name ?? `State ${st.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Destination Area</Label>
              <Select
                value={form.destinationAreaId != null ? String(form.destinationAreaId) : ""}
                onValueChange={(v) => setForm((s) => ({ ...s, destinationAreaId: v ? +v : null }))}
                disabled={form.destinationStateId == null}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {destinationAreasList.map((a: AreaResponse) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name ?? `Area ${a.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Weight (grams)</Label>
              <Input
                type="number"
                min={0}
                value={form.minWeightGrams ?? 0}
                onChange={(e) => setForm((s) => ({ ...s, minWeightGrams: +e.target.value || 0 }))}
              />
            </div>

            <div>
              <Label>Max Weight (grams)</Label>
              <Input
                type="number"
                min={0}
                value={form.maxWeightGrams ?? 0}
                onChange={(e) => setForm((s) => ({ ...s, maxWeightGrams: +e.target.value || 0 }))}
              />
            </div>

            <div>
              <Label>Fee</Label>
              <Input
                type="number"
                min={0}
                value={form.fee ?? 0}
                onChange={(e) => setForm((s) => ({ ...s, fee: +e.target.value || 0 }))}
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                min={0}
                value={form.priority ?? 1}
                onChange={(e) => setForm((s) => ({ ...s, priority: +e.target.value || 1 }))}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Cap (optional)</Label>
              <Input
                type="number"
                value={form.cap ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, cap: e.target.value === "" ? null : +e.target.value }))}
              />
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
