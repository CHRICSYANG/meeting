import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Check,
  CheckCheck,
  ClipboardCopy,
  Download,
  ExternalLink,
  ScanLine,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventCover } from "@/components/EventCover";
import { EventStatusBadge, RegStatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  bulkApprove,
  checkIn,
  issueAllForEvent,
  issueCertificate,
  setRegStatus,
  updateEvent,
  useDB,
} from "@/lib/store";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/format";
import { downloadCertificate } from "@/lib/certificate";
import { cn } from "@/lib/utils";
import type { RegStatus } from "@/lib/types";

const filters: { key: "all" | RegStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "rejected", label: "未通过" },
  { key: "cancelled", label: "已取消" },
];

export function EventManage() {
  const { id = "" } = useParams();
  const db = useDB();
  const event = db.events.find((e) => e.id === id);
  const [tab, setTab] = useState("regs");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RegStatus>("all");

  const regs = useMemo(
    () =>
      db.registrations
        .filter((r) => r.eventId === id)
        .filter((r) => (status === "all" ? true : r.status === status))
        .filter((r) => {
          const q = query.trim();
          if (!q) return true;
          return [r.name, r.org, r.code, r.phone, r.email].some((v) => v.includes(q));
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.registrations, id, status, query],
  );

  if (!event) {
    return (
      <div>
        <AdminPageHeader title="活动不存在" description="该活动可能已被删除。" />
        <Link to="/admin/events" className="text-xs text-primary underline-offset-4 hover:underline">
          返回活动管理
        </Link>
      </div>
    );
  }

  const all = db.registrations.filter((r) => r.eventId === id);
  const approved = all.filter((r) => r.status === "approved");
  const pending = all.filter((r) => r.status === "pending");
  const checked = all.filter((r) => r.checkedInAt);
  const certs = db.certificates.filter((c) => c.eventId === id);
  const pendingCerts = checked.filter((r) => !certs.some((c) => c.registrationId === r.id));
  const rate = approved.length ? Math.round((checked.length / approved.length) * 100) : 0;

  return (
    <div>
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        活动管理
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <EventCover event={event} className="h-20 w-full shrink-0 rounded-xl sm:w-28" compact />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <EventStatusBadge status={event.status} />
              <span className="text-[10px] text-muted-foreground">{event.category}</span>
            </div>
            <h1 className="mt-1.5 truncate font-display text-[19px] text-ink">{event.title}</h1>
            <p className="num mt-1 text-[11px] text-muted-foreground">
              {fmtDate(event.startAt)} {fmtTime(event.startAt)} – {fmtTime(event.endAt)} · {event.city} ·{" "}
              {event.venue}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/events/${event.slug}`}
              target="_blank"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] text-ink transition-colors hover:border-primary/30"
            >
              <ExternalLink className="size-3" />
              报名页
            </Link>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/events/${event.slug}`);
                toast.success("报名链接已复制");
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-[11px] text-ink transition-colors hover:border-primary/30"
            >
              <ClipboardCopy className="size-3" />
              复制链接
            </button>
            <button
              type="button"
              onClick={() => {
                const next = event.status === "open" ? "closed" : "open";
                updateEvent(event.id, { status: next });
                toast.success(next === "open" ? "已重新开放报名" : "已停止报名");
              }}
              className="inline-flex h-8 cursor-pointer items-center rounded-full bg-primary px-3.5 text-[11px] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {event.status === "open" ? "停止报名" : "开放报名"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 sm:grid-cols-4">
          {[
            { k: "有效报名", v: approved.length, s: `${pending.length} 待审核` },
            { k: "已签到", v: checked.length, s: `签到率 ${rate}%` },
            { k: "已发证书", v: certs.length, s: `${pendingCerts.length} 待签发` },
            { k: "席位使用", v: `${Math.round((all.length / Math.max(1, event.capacity)) * 100)}%`, s: `${event.capacity} 席` },
          ].map((m) => (
            <div key={m.k} className="px-4 py-3">
              <p className="text-[10px] text-muted-foreground">{m.k}</p>
              <p className="num mt-1 font-display text-xl text-ink">{m.v}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{m.s}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-full bg-secondary/70 p-1">
            <TabsTrigger value="regs" className="rounded-full px-4 text-xs data-[state=active]:bg-card">
              报名名单
              <span className="num ml-1.5 text-[10px] text-muted-foreground">{all.length}</span>
            </TabsTrigger>
            <TabsTrigger value="checkin" className="rounded-full px-4 text-xs data-[state=active]:bg-card">
              签到记录
              <span className="num ml-1.5 text-[10px] text-muted-foreground">{checked.length}</span>
            </TabsTrigger>
            <TabsTrigger value="certs" className="rounded-full px-4 text-xs data-[state=active]:bg-card">
              证书发放
              <span className="num ml-1.5 text-[10px] text-muted-foreground">{certs.length}</span>
            </TabsTrigger>
          </TabsList>

          <Link
            to="/admin/checkin"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] text-ink transition-colors hover:border-primary/30"
          >
            <ScanLine className="size-3" />
            打开签到台
          </Link>
        </div>

        <TabsContent value="regs" className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-3">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索姓名 / 单位 / 报名号 / 手机号"
                  className="h-8 w-full rounded-full border border-input bg-background pl-8 pr-3 text-xs outline-none transition-colors focus:border-primary/40"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatus(f.key)}
                    className={cn(
                      "cursor-pointer rounded-full px-2.5 py-1 text-[11px] transition-colors",
                      status === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={pending.length === 0}
                onClick={() => {
                  const n = bulkApprove(event.id);
                  toast.success(`已通过 ${n} 条报名`);
                }}
                className="ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 text-[11px] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck className="size-3.5" />
                批量通过 ({pending.length})
              </button>
            </div>

            <div className="divide-y divide-border/60">
              {regs.map((r) => {
                const cert = certs.find((c) => c.registrationId === r.id);
                const ticket = event.ticketTypes.find((t) => t.id === r.ticketTypeId);
                return (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display text-xs text-ink">
                      {r.name.slice(0, 1)}
                    </span>
                    <div className="min-w-[140px] flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-ink">{r.name}</p>
                        <span className="num text-[10px] text-muted-foreground">{r.code}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {r.org} · {r.title || "—"}
                      </p>
                    </div>
                    <div className="hidden w-24 shrink-0 text-[11px] text-muted-foreground sm:block">
                      {ticket?.name ?? "标准票"}
                    </div>
                    <div className="hidden w-28 shrink-0 text-[10px] text-muted-foreground lg:block">
                      <p>{fmtDateTime(r.createdAt)}</p>
                      <p className={cn("mt-0.5", r.checkedInAt ? "text-emerald-700" : "text-muted-foreground/70")}>
                        {r.checkedInAt ? `已签到 ${fmtTime(r.checkedInAt)}` : "未签到"}
                      </p>
                    </div>
                    <RegStatusBadge status={r.status} />
                    <div className="flex items-center gap-1">
                      {r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRegStatus(r.id, "approved");
                              toast.success(`${r.name} 已通过审核`);
                            }}
                            className="grid size-7 cursor-pointer place-items-center rounded-full border border-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-50"
                            title="通过"
                          >
                            <Check className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRegStatus(r.id, "rejected");
                              toast.success(`${r.name} 已标记为未通过`);
                            }}
                            className="grid size-7 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            title="拒绝"
                          >
                            <X className="size-3.5" />
                          </button>
                        </>
                      )}
                      {r.status === "approved" && !r.checkedInAt && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = checkIn(r.code, event.id);
                            toast[res.ok ? "success" : "error"](res.message);
                          }}
                          className="inline-flex h-7 cursor-pointer items-center rounded-full border border-border px-2.5 text-[10px] text-ink transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          签到
                        </button>
                      )}
                      {r.checkedInAt && !cert && event.certEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            const c = issueCertificate(r.id);
                            if (c) toast.success(`已签发 ${c.certNo}`);
                            else toast.error("签发失败，请检查活动证书设置");
                          }}
                          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border border-gold/40 bg-gold-soft/30 px-2.5 text-[10px] text-[#7A5C15] transition-colors hover:bg-gold-soft/60"
                        >
                          <Award className="size-3" />
                          发证
                        </button>
                      )}
                      {cert && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadCertificate({
                              name: cert.name,
                              eventTitle: cert.eventTitle,
                              certNo: cert.certNo,
                              issuedAt: new Date(cert.issuedAt).toISOString().slice(0, 10),
                              organizer: event.organizer,
                              dateText: fmtDate(event.startAt).replace(/\s/g, ""),
                              templateId: cert.templateId,
                            })
                          }
                          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Download className="size-3" />
                          证书
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {regs.length === 0 && (
                <p className="px-4 py-14 text-center text-xs text-muted-foreground">没有符合条件的报名记录</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="checkin" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-xs text-ink">已签到名单</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">签到时间由现场核验自动记录，不可手工修改。</p>
              </div>
              <div className="divide-y divide-border/60">
                {checked.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 font-display text-[11px] text-emerald-700">
                      {r.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-ink">{r.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{r.org}</p>
                    </div>
                    <span className="num text-[11px] text-muted-foreground">{fmtDateTime(r.checkedInAt!)}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        certs.some((c) => c.registrationId === r.id)
                          ? "bg-gold-soft/50 text-[#7A5C15]"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {certs.some((c) => c.registrationId === r.id) ? "已发证" : "待发证"}
                    </span>
                  </div>
                ))}
                {checked.length === 0 && (
                  <p className="px-4 py-14 text-center text-xs text-muted-foreground">暂无签到记录</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-[11px] text-muted-foreground">签到率</p>
                <p className="num mt-1 font-display text-4xl text-ink">{rate}%</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-emerald-500/80" style={{ width: `${Math.min(100, rate)}%` }} />
                </div>
                <p className="num mt-2 text-[10px] text-muted-foreground">
                  {checked.length} / {approved.length} 位已通过参会者到场
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-border p-5 text-[11px] leading-relaxed text-muted-foreground">
                现场签到请使用「签到台」，支持报名号、手机号与姓名核验，避免重复签到。
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certs" className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div>
                <p className="text-xs text-ink">证书签发</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  仅向已签到参会者签发，编号自动生成且全局唯一。
                </p>
              </div>
              <button
                type="button"
                disabled={pendingCerts.length === 0}
                onClick={() => {
                  const n = issueAllForEvent(event.id);
                  toast.success(n ? `已批量签发 ${n} 份证书` : "没有可签发的记录");
                }}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 text-[11px] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Award className="size-3.5" />
                一键签发全部 ({pendingCerts.length})
              </button>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60 sm:grid-cols-3">
              <div className="px-4 py-3">
                <p className="text-[10px] text-muted-foreground">已签发</p>
                <p className="num mt-1 font-display text-xl text-ink">{certs.length}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-muted-foreground">待签发</p>
                <p className="num mt-1 font-display text-xl text-ink">{pendingCerts.length}</p>
              </div>
              <div className="col-span-2 px-4 py-3 sm:col-span-1">
                <p className="text-[10px] text-muted-foreground">模板</p>
                <p className="mt-1 text-xs text-ink">
                  {db.templates.find((t) => t.id === event.certTemplateId)?.name ?? "典藏 · 金线"}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {certs.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-soft/50 text-gold">
                    <Award className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink">
                      {c.name}
                      <span className="num ml-2 text-[10px] text-muted-foreground">{c.certNo}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">签发于 {fmtDateTime(c.issuedAt)}</p>
                  </div>
                  <Link
                    to={`/verify/${c.certNo}`}
                    target="_blank"
                    className="text-[10px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    验真页
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCertificate({
                        name: c.name,
                        eventTitle: c.eventTitle,
                        certNo: c.certNo,
                        issuedAt: new Date(c.issuedAt).toISOString().slice(0, 10),
                        organizer: event.organizer,
                        dateText: fmtDate(event.startAt).replace(/\s/g, ""),
                        templateId: c.templateId,
                      })
                    }
                    className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="size-3" />
                    下载
                  </button>
                </div>
              ))}
              {certs.length === 0 && (
                <p className="px-4 py-14 text-center text-xs text-muted-foreground">尚未签发证书</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
