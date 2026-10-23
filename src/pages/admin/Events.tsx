import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventCover } from "@/components/EventCover";
import { EventStatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, useDB } from "@/lib/store";
import { fmtDateShort, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Events() {
  const db = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "论坛",
    startAt: "2026-11-20T09:00",
    endAt: "2026-11-20T17:00",
    venue: "",
    city: "杭州",
    capacity: 120,
    requireApproval: false,
    certEnabled: true,
    summary: "",
    tone: "ink" as "ink" | "teal" | "brick" | "slate",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 4) {
      toast.error("请填写完整的活动名称");
      return;
    }
    if (!form.venue.trim()) {
      toast.error("请填写活动场地");
      return;
    }
    createEvent({
      title: form.title,
      subtitle: form.subtitle,
      category: form.category,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      venue: form.venue,
      city: form.city,
      capacity: Number(form.capacity) || 100,
      requireApproval: form.requireApproval,
      certEnabled: form.certEnabled,
      summary: form.summary,
      tone: form.tone,
    });
    toast.success("活动已创建，报名页已同步开放");
    setOpen(false);
    setForm((f) => ({ ...f, title: "", subtitle: "", venue: "", summary: "" }));
  }

  const tones: { key: typeof form.tone; label: string; color: string }[] = [
    { key: "ink", label: "墨蓝", color: "#17306E" },
    { key: "teal", label: "松绿", color: "#0F4B45" },
    { key: "brick", label: "砖红", color: "#71392E" },
    { key: "slate", label: "岩灰", color: "#2A3346" },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="EVENTS"
        title="活动管理"
        description="创建活动、设定票种与审核规则，发布后参会者即可在活动日历中报名。"
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            新建活动
          </button>
        }
      />

      <div className="space-y-3">
        {db.events.map((e) => {
          const list = db.registrations.filter((r) => r.eventId === e.id && r.status !== "rejected");
          const checked = list.filter((r) => r.checkedInAt).length;
          const certs = db.certificates.filter((c) => c.eventId === e.id).length;
          const pct = Math.round((list.length / Math.max(1, e.capacity)) * 100);

          return (
            <div
              key={e.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-primary/25"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
                <EventCover event={e} className="h-24 w-full shrink-0 rounded-xl sm:w-36" compact />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventStatusBadge status={e.status} />
                    <span className="text-[10px] tracking-wide text-muted-foreground">{e.category}</span>
                    {e.requireApproval && (
                      <span className="rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">
                        需审核
                      </span>
                    )}
                    {e.certEnabled && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        提供证书
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/admin/events/${e.id}`}
                    className="mt-2 block truncate font-display text-[17px] text-ink transition-colors hover:text-primary"
                  >
                    {e.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="num">
                      {fmtDateShort(e.startAt)} {fmtTime(e.startAt)} – {fmtTime(e.endAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />
                      {e.city} · {e.venue}
                    </span>
                  </div>
                </div>

                <div className="grid shrink-0 grid-cols-3 gap-4 border-t border-border/60 pt-3 sm:w-[230px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  {[
                    { k: "报名", v: list.length },
                    { k: "签到", v: checked },
                    { k: "证书", v: certs },
                  ].map((m) => (
                    <div key={m.k}>
                      <p className="num font-display text-lg text-ink">{m.v}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{m.k}</p>
                    </div>
                  ))}
                  <div className="col-span-3">
                    <div className="h-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <p className="num mt-1 text-[10px] text-muted-foreground">
                      {list.length}/{e.capacity} 席 · {pct}%
                    </p>
                  </div>
                </div>

                <Link
                  to={`/admin/events/${e.id}`}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-border px-4 text-xs text-ink transition-colors hover:border-primary/30 hover:text-primary sm:self-center"
                >
                  管理
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">新建活动</DialogTitle>
            <DialogDescription className="text-xs">
              活动创建后立即开放报名，可在活动管理中继续调整票种与议程。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="mt-2 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs">活动名称 *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="如：2026 高校数字化转型高峰论坛"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">一句话主题</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="出现在活动卡片与详情页标题下方"
                className="h-10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">活动类型</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="论坛 / 工作坊 / 研修班"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">席位数</Label>
                <Input
                  type="number"
                  min={10}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="num h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">开始时间</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className="num h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">结束时间</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="num h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">城市</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">场地 *</Label>
                <Input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="如：国际会议中心 · 主会场"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">活动简介</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="两句话说明这场活动解决什么问题、面向谁"
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">封面配色</Label>
              <div className="flex gap-2">
                {tones.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, tone: t.key })}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                      form.tone === t.key ? "border-primary/40 bg-primary/[0.05] text-ink" : "border-border text-muted-foreground",
                    )}
                  >
                    <span className="size-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-xl bg-secondary/50 p-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={form.requireApproval}
                  onChange={(e) => setForm({ ...form, requireApproval: e.target.checked })}
                  className="mt-0.5 size-4 cursor-pointer accent-[#17306E]"
                />
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="block text-xs text-ink">需要审核</span>
                  报名后进入待审核，由会务组确认席位
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={form.certEnabled}
                  onChange={(e) => setForm({ ...form, certEnabled: e.target.checked })}
                  className="mt-0.5 size-4 cursor-pointer accent-[#17306E]"
                />
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="block text-xs text-ink">提供参会证书</span>
                  签到达标后可下载电子证书
                </span>
              </label>
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 cursor-pointer rounded-full border border-border px-5 text-xs text-ink transition-colors hover:bg-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <CalendarPlus className="size-3.5" />
                创建并开放报名
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
