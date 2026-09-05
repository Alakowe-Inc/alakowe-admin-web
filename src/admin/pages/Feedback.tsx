import { useState } from "react";
import { Eye, X, Mail, Trash2 } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Paginator } from "@/admin/components/Paginator";
import { useAdminFeedback, useUpdateFeedbackStatus, useDeleteFeedback } from "@/lib/api/admin/admin.hooks";
import type { FeedbackItem } from "@/lib/api/admin/admin.api";
import { toast } from "react-toastify";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Pending", value: 1 as const },
  { label: "Reviewed", value: 2 as const },
  { label: "Resolved", value: 3 as const },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];
type FeedbackStatus = 1 | 2 | 3;

const STATUS_LABEL_MAP: Record<FeedbackStatus, string> = {
  1: "Pending",
  2: "Reviewed",
  3: "Resolved",
};

const STATUS_VALUE_MAP: Record<string, FeedbackStatus> = {
  Pending: 1,
  Reviewed: 2,
  Resolved: 3,
};

const PAGE_SIZE = 10;
const TRUNCATE_LEN = 80;

// ── Detail Modal ──────────────────────────────────────────────────────────────

interface DetailModalProps {
  item: FeedbackItem;
  onClose: () => void;
}

function DetailModal({ item, onClose }: DetailModalProps) {
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFeedback = useDeleteFeedback();
  const [localStatus, setLocalStatus] = useState<FeedbackStatus>(
    STATUS_VALUE_MAP[item.status] ?? 1
  );

  const handleStatusChange = (val: FeedbackStatus) => {
    setLocalStatus(val);
    updateStatus.mutate(
      { id: item.id, status: val },
      {
        onSuccess: () => toast.success(`Status updated to ${STATUS_LABEL_MAP[val]}`),
        onError: () => {
          setLocalStatus(STATUS_VALUE_MAP[item.status] ?? 1);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    deleteFeedback.mutate(item.id, {
      onSuccess: () => {
        toast.success("Feedback deleted");
        onClose();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Feedback Detail
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          {/* Sender info */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                {item.name ?? "Anonymous"}
              </p>
              {item.email ? (
                <a
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  {item.email}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No email provided</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {item.dateCreated ? new Date(item.dateCreated).toLocaleString() : "—"}
            </p>
          </div>

          {/* Message */}
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-foreground leading-relaxed">
            {item.message}
          </div>

          {/* Status change */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <select
              value={localStatus}
              onChange={(e) => handleStatusChange(Number(e.target.value) as FeedbackStatus)}
              disabled={updateStatus.isPending}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            >
              {([1, 2, 3] as FeedbackStatus[]).map((v) => (
                <option key={v} value={v}>
                  {STATUS_LABEL_MAP[v]}
                </option>
              ))}
            </select>
            {updateStatus.isPending && (
              <span className="text-xs text-muted-foreground">Saving…</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border/50 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteFeedback.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" size="sm" className="ml-auto flex-1 rounded-xl" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Feedback() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const { data, isLoading, isError } = useAdminFeedback({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    status: statusFilter,
  });

  const items = data?.result ?? [];
  const total = data?.totalCount ?? 0;

  const handleFilterChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Review and respond to user-submitted feedback.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-soft">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => handleFilterChange(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <PageCard
        title="All Feedback"
        description={`${total} item${total === 1 ? "" : "s"}`}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Loading feedback…
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-destructive">
                    Failed to load feedback. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No feedback matches your filters.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40"
                    onClick={() => setSelected(item)}
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : "—"}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-foreground">
                      {item.name ?? (
                        <span className="italic text-muted-foreground">Anonymous</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {item.email ? (
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Message (truncated) */}
                    <td className="max-w-xs px-5 py-3 text-muted-foreground">
                      {item.message.length > TRUNCATE_LEN
                        ? `${item.message.slice(0, TRUNCATE_LEN)}…`
                        : item.message}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* View button */}
                    <td
                      className="px-5 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() => setSelected(item)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border/50 px-4">
          <Paginator
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      </PageCard>

      {/* Detail modal */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
