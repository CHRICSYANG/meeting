import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus, RegStatus } from "@/lib/types";

const regMap: Record<RegStatus, { label: string; className: string }> = {
  pending: { label: "待审核", className: "border-amber-300/70 bg-amber-50 text-amber-800" },
  approved: { label: "已通过", className: "border-emerald-300/70 bg-emerald-50 text-emerald-800" },
  rejected: { label: "未通过", className: "border-rose-300/70 bg-rose-50 text-rose-700" },
  cancelled: { label: "已取消", className: "border-slate-300/70 bg-slate-50 text-slate-600" },
};

const eventMap: Record<EventStatus, { label: string; className: string }> = {
  open: { label: "报名中", className: "border-emerald-300/70 bg-emerald-50 text-emerald-800" },
  draft: { label: "草稿", className: "border-slate-300/70 bg-slate-50 text-slate-600" },
  closed: { label: "报名截止", className: "border-amber-300/70 bg-amber-50 text-amber-800" },
  ended: { label: "已结束", className: "border-slate-300/70 bg-white/80 text-slate-600" },
};

export function RegStatusBadge({ status, className }: { status: RegStatus; className?: string }) {
  const meta = regMap[status];
  return (
    <Badge variant="outline" className={cn("font-normal", meta.className, className)}>
      <span
        className={cn(
          "mr-1 inline-block size-1.5 rounded-full",
          status === "approved" && "bg-emerald-500",
          status === "pending" && "bg-amber-500",
          status === "rejected" && "bg-rose-500",
          status === "cancelled" && "bg-slate-400",
        )}
      />
      {meta.label}
    </Badge>
  );
}

export function EventStatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const meta = eventMap[status];
  return (
    <Badge variant="outline" className={cn("font-normal", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
