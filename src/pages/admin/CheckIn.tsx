import { useState } from "react";
import { AlertTriangle, CheckCircle2, Keyboard, ScanLine, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RegStatusBadge } from "@/components/StatusBadge";
import { checkIn, useDB } from "@/lib/store";
import { fmtDateTime, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Registration } from "@/lib/types";

export function CheckIn() {
  const db = useDB();
  const openEvents = db.events.filter((e) => e.status !== "draft");
  const [eventId, setEventId] = useState(openEvents.find((e) => e.status === "open")?.id ?? openEvents[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; registration?: Registration } | null>(null);

  const event = db.events.find((e) => e.id === eventId);
  const eventRegs = db.registrations.filter((r) => r.eventId === eventId);
  const checked = eventRegs.filter((r) => r.checkedInAt).sort((a, b) => (b.checkedInAt ?? "").localeCompare(a.checkedInAt ?? ""));
  const approved = eventRegs.filter((r) => r.status === "approved");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim()) {
      toast.error("请输入报名号或手机号");
      return;
    }
    const res = checkIn(code.trim(), eventId);
    setResult(res);
    if (res.ok && res.registration?.checkedInAt) {
      toast.success(res.message);
      setCode("");
    }
  }

  function simulate() {
    const candidate = approved.find((r) => !r.checkedInAt);
    if (!candidate) {
      toast.error("没有可模拟的未签到报名");
      return;
    }
    setCode(candidate.code);
    const res = checkIn(candidate.code, eventId);
    setResult(res);
    setCode("");
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="ON-SITE"
        title="现场签到台"
        description="核验报名号、手机号或姓名，签到成功即写入记录，可用于会后证书签发。"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setResult(null);
                setCode("");
              }}
              className="h-9 max-w-[260px] cursor-pointer rounded-full border border-border bg-card px-3 text-[11px] text-ink outline-none focus:border-primary/40"
            >
              {openEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={simulate}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ScanLine className="size-3.5" />
              模拟扫码
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="border-b border-border/60 px-5 py-4">
              <p className="text-[11px] text-muted-foreground">当前活动</p>
              <p className="mt-1 font-display text-[15px] text-ink">{event?.title ?? "请选择活动"}</p>
              <p className="num mt-0.5 text-[10px] text-muted-foreground">
                {event ? `${fmtDateTime(event.startAt)} · ${event.venue}` : ""}
              </p>
            </div>

            <form onSubmit={submit} className="p-5">
              <label className="text-[11px] text-muted-foreground">报名号 / 手机号 / 姓名</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setResult(null);
                    }}
                    placeholder="例如 MF261003 或 13800012345"
                    className="num h-14 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-lg tracking-wide outline-none transition-colors placeholder:text-sm placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 shrink-0 cursor-pointer rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  核验签到
                </button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Keyboard className="size-3" />
                扫码枪可直接输入并回车；支持模糊匹配姓名，重名时会提示核对单位。
              </p>
            </form>
          </div>

          {/* result */}
          {result && (
            <div
              className={cn(
                "animate-rise overflow-hidden rounded-2xl border p-6",
                result.ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60",
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full",
                    result.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600",
                  )}
                >
                  {result.ok ? <CheckCircle2 className="size-6" /> : <AlertTriangle className="size-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-display text-xl", result.ok ? "text-emerald-900" : "text-rose-900")}>
                    {result.message}
                  </p>
                  {result.registration && (
                    <div className="mt-4 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground">参会人</p>
                        <p className="mt-0.5 font-display text-[15px] text-ink">{result.registration.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">报名号</p>
                        <p className="num mt-0.5 text-ink">{result.registration.code}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground">单位 / 职务</p>
                        <p className="mt-0.5 text-ink">
                          {result.registration.org} · {result.registration.title || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">签到时间</p>
                        <p className="num mt-0.5 text-ink">
                          {result.registration.checkedInAt ? fmtTime(result.registration.checkedInAt) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">状态</p>
                        <div className="mt-1">
                          <RegStatusBadge status={result.registration.status} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <p className="text-xs text-ink">最近签到</p>
              <span className="num text-[10px] text-muted-foreground">{checked.length} 人已到场</span>
            </div>
            <div className="divide-y divide-border/60">
              {checked.slice(0, 6).map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-[10px] text-emerald-700">
                    <UserCheck className="size-3.5" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-xs text-ink">
                    {r.name}
                    <span className="ml-2 text-[10px] text-muted-foreground">{r.org}</span>
                  </p>
                  <span className="num text-[10px] text-muted-foreground">{fmtDateTime(r.checkedInAt!)}</span>
                </div>
              ))}
              {checked.length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-muted-foreground">本场还没有签到记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] text-muted-foreground">到场进度</p>
            <p className="num mt-1 font-display text-4xl text-ink">
              {checked.length}
              <span className="ml-1 text-base text-muted-foreground">/ {approved.length}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-all"
                style={{ width: `${approved.length ? (checked.length / approved.length) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-secondary/60 py-2.5">
                <p className="num font-display text-lg text-ink">{eventRegs.filter((r) => r.status === "pending").length}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">待审核</p>
              </div>
              <div className="rounded-xl bg-secondary/60 py-2.5">
                <p className="num font-display text-lg text-ink">{approved.length - checked.length}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">未到场</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-5 text-[11px] leading-relaxed text-muted-foreground">
            <p className="text-xs text-ink">异常处理</p>
            <ul className="mt-2 space-y-1.5">
              <li>· 待审核报名不可签到，请先在报名名单中审核。</li>
              <li>· 重复签到会提示已签到，不会覆盖首次时间。</li>
              <li>· 已取消或未通过的报名请引导至人工通道。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
