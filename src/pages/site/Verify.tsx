import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Download, ScanLine, Search, ShieldCheck, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useDB } from "@/lib/store";
import { drawCertificate, downloadCertificate } from "@/lib/certificate";
import { fmtDate, fmtDateTime } from "@/lib/format";

export function Verify() {
  const { certNo = "" } = useParams();
  const db = useDB();
  const navigate = useNavigate();
  const [input, setInput] = useState(certNo);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cert = certNo
    ? db.certificates.find((c) => c.certNo.toLowerCase() === certNo.trim().toLowerCase())
    : undefined;
  const reg = cert ? db.registrations.find((r) => r.id === cert.registrationId) : undefined;
  const event = cert ? db.events.find((e) => e.id === cert.eventId) : undefined;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) navigate(`/verify/${input.trim()}`);
  };

  useEffect(() => {
    if (!cert || !event || !canvasRef.current) return;
    drawCertificate(canvasRef.current, {
      name: cert.name,
      eventTitle: cert.eventTitle,
      certNo: cert.certNo,
      issuedAt: new Date(cert.issuedAt).toISOString().slice(0, 10),
      organizer: event.organizer,
      dateText: fmtDate(event.startAt).replace(/\s/g, ""),
      templateId: cert.templateId,
    });
  }, [cert, event]);

  const payload = cert && event
    ? {
        name: cert.name,
        eventTitle: cert.eventTitle,
        certNo: cert.certNo,
        issuedAt: new Date(cert.issuedAt).toISOString().slice(0, 10),
        organizer: event.organizer,
        dateText: fmtDate(event.startAt).replace(/\s/g, ""),
        templateId: cert.templateId,
      }
    : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[860px] px-5 pb-24 pt-12">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.35em] text-gold">CERTIFICATE VERIFICATION</p>
          <h1 className="mt-3 font-display text-3xl text-ink">证书验真</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            输入证书编号，核对该证书是否由会务通签发、持证人信息与参会记录是否一致。
          </p>
        </div>

        <form onSubmit={search} className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="例如 MF-2026-0001"
              className="num h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm tracking-wide outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-full bg-primary px-6 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            验证
          </button>
        </form>

        {!certNo && (
          <div className="mx-auto mt-5 flex max-w-lg items-start gap-3 rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>
              演示环境已预置证书：<span className="num text-ink">MF-2026-0001</span> 至{" "}
              <span className="num text-ink">MF-2026-0007</span>，可直接输入体验。
            </span>
          </div>
        )}

        {certNo && !cert && (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center">
            <XCircle className="mx-auto size-10 text-rose-500" />
            <p className="mt-4 font-display text-xl text-ink">未查询到该证书</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              编号 <span className="num">{certNo}</span> 不在签发记录中，请核对后重试。
            </p>
          </div>
        )}

        {cert && event && payload && (
          <div className="animate-rise mx-auto mt-10 max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center gap-3 border-b border-border/70 bg-emerald-50/60 px-6 py-4">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-900">证书真实有效</p>
                <p className="mt-0.5 text-[11px] text-emerald-700/80">
                  由会务通签发 · 签发时间 {fmtDateTime(cert.issuedAt)}
                </p>
              </div>
              <span className="num ml-auto hidden text-[11px] text-emerald-800/70 sm:block">{cert.certNo}</span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_220px]">
              <div>
                <h2 className="font-display text-xl text-ink">{cert.eventTitle}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">持证人</dt>
                    <dd className="mt-1 font-display text-[15px] text-ink">{cert.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">证书编号</dt>
                    <dd className="num mt-1 text-ink">{cert.certNo}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">活动时间</dt>
                    <dd className="num mt-1 text-ink">{fmtDate(event.startAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">签到记录</dt>
                    <dd className="mt-1 text-ink">
                      {reg?.checkedInAt ? `已签到 ${fmtDateTime(reg.checkedInAt)}` : "已核验"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">所在单位</dt>
                    <dd className="mt-1 text-ink">{reg?.org ?? "—"}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCertificate(payload)}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="size-3.5" />
                    下载证书副本
                  </button>
                  <Link
                    to={`/events/${event.slug}`}
                    className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs text-ink transition-colors hover:border-primary/30"
                  >
                    查看活动
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-2">
                <canvas ref={canvasRef} className="w-full rounded-lg shadow-sm" aria-label="证书预览" />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border/70 px-6 py-3 text-[10px] text-muted-foreground">
              <ScanLine className="size-3.5" />
              证书编号在系统中唯一，重复编号或信息不符即视为无效。
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
