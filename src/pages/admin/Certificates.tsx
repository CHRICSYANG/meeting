import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BadgeCheck, Download, FileWarning, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { drawCertificate, downloadCertificate } from "@/lib/certificate";
import { issueAllForEvent, revokeCertificate, useDB } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function TemplatePreview({ templateId, className }: { templateId: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    drawCertificate(ref.current, {
      name: "张亦驰",
      eventTitle: "2026 高校数字化转型高峰论坛",
      certNo: "MF-2026-0001",
      issuedAt: "2026-09-20",
      organizer: "会务通 · 高校数字化协作组",
      dateText: "2026年11月8日",
      templateId,
    });
  }, [templateId]);

  return <canvas ref={ref} className={cn("w-full rounded-lg border border-border/60 shadow-xs", className)} />;
}

export function Certificates() {
  const db = useDB();
  const [query, setQuery] = useState("");

  const certs = db.certificates
    .filter((c) => {
      const q = query.trim();
      if (!q) return true;
      return c.name.includes(q) || c.certNo.toLowerCase().includes(q.toLowerCase()) || c.eventTitle.includes(q);
    })
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const checked = db.registrations.filter((r) => r.checkedInAt);
  const pending = checked.filter((r) => !db.certificates.some((c) => c.registrationId === r.id));
  const pendingByEvent = db.events
    .map((e) => ({ event: e, count: pending.filter((r) => r.eventId === e.id).length }))
    .filter((x) => x.count > 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="CERTIFICATES"
        title="证书中心"
        description="选择证书版式、批量为达标参会者签发，并管理已签发证书的下载与作废。"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
            <BadgeCheck className="size-3.5 text-emerald-600" />
            在线验真已开启
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="已签发" value={db.certificates.length} hint="全部活动累计" accent icon={<Award className="size-4" />} />
        <StatCard label="待签发" value={pending.length} hint="已签到未发证" icon={<FileWarning className="size-4" />} />
        <StatCard label="证书模板" value={db.templates.length} hint="支持 PNG 下载与打印" icon={<Sparkles className="size-4" />} />
        <StatCard
          label="可发证活动"
          value={db.events.filter((e) => e.certEnabled).length}
          hint={`共 ${db.events.length} 场活动`}
          icon={<BadgeCheck className="size-4" />}
        />
      </div>

      <section className="mt-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">证书版式</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">每场活动可指定一种版式，签发时按当前版式生成。</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {db.templates.map((t) => {
            const used = db.events.filter((e) => e.certTemplateId === t.id).length;
            return (
              <div key={t.id} className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card">
                <TemplatePreview templateId={t.id} />
                <div className="px-1 pb-1 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-[15px] text-ink">{t.name}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {used} 场在用
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{t.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-xs text-ink">已签发证书</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">作废后编号立即失效，验真页将提示无效。</p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索姓名 / 编号 / 活动"
                className="h-8 w-full rounded-full border border-input bg-background pl-8 pr-3 text-xs outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {certs.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-soft/50 text-gold">
                  <Award className="size-3.5" />
                </span>
                <div className="min-w-[130px] flex-1">
                  <p className="text-xs text-ink">
                    {c.name}
                    <span className="num ml-2 text-[10px] text-muted-foreground">{c.certNo}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{c.eventTitle}</p>
                </div>
                <span className="num hidden text-[10px] text-muted-foreground sm:block">
                  {fmtDateTime(c.issuedAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/verify/${c.certNo}`}
                    target="_blank"
                    className="inline-flex h-7 items-center rounded-full border border-border px-2.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    验真
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const ev = db.events.find((e) => e.id === c.eventId);
                      downloadCertificate({
                        name: c.name,
                        eventTitle: c.eventTitle,
                        certNo: c.certNo,
                        issuedAt: new Date(c.issuedAt).toISOString().slice(0, 10),
                        organizer: ev?.organizer ?? "会务通",
                        dateText: ev ? fmtDate(ev.startAt).replace(/\s/g, "") : "",
                        templateId: c.templateId,
                      });
                    }}
                    className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="size-3" />
                    下载
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      revokeCertificate(c.id);
                      toast.success(`已作废 ${c.certNo}`);
                    }}
                    className="grid size-7 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    title="作废证书"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
            {certs.length === 0 && (
              <p className="px-4 py-14 text-center text-xs text-muted-foreground">暂无匹配的证书</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs text-ink">批量签发</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              仅为已签到且未发证的参会者签发，重复执行不会产生重复编号。
            </p>
            <div className="mt-4 space-y-3">
              {pendingByEvent.map(({ event, count }) => (
                <div key={event.id} className="rounded-xl border border-border/80 p-3">
                  <p className="truncate text-[11px] text-ink">{event.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="num text-[10px] text-muted-foreground">{count} 人待签发</span>
                    <button
                      type="button"
                      onClick={() => {
                        const n = issueAllForEvent(event.id);
                        toast.success(`已签发 ${n} 份证书`);
                      }}
                      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Award className="size-3" />
                      签发
                    </button>
                  </div>
                </div>
              ))}
              {pendingByEvent.length === 0 && (
                <p className="rounded-xl bg-secondary/60 px-3 py-6 text-center text-[10px] text-muted-foreground">
                  所有已签到参会者均已签发证书
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-5 text-[11px] leading-relaxed text-muted-foreground">
            <p className="text-xs text-ink">签发规则</p>
            <ul className="mt-2 space-y-1.5">
              <li>· 必须存在签到记录，防止代领。</li>
              <li>· 编号格式 MF-年份-序号，全局唯一。</li>
              <li>· 作废后重新签发将生成新编号。</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
