import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Download,
  MapPin,
  Printer,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QrCode } from "@/components/QrCode";
import { RegStatusBadge } from "@/components/StatusBadge";
import { getCertificateFor, issueCertificate, setRegStatus, useDB } from "@/lib/store";
import { fmtDate, fmtRange, fmtTime, money } from "@/lib/format";
import { downloadCertificate, printCertificate } from "@/lib/certificate";
import { cn } from "@/lib/utils";

export function TicketPage() {
  const { code = "" } = useParams();
  const db = useDB();
  const reg = db.registrations.find((r) => r.code.toLowerCase() === code.toLowerCase());
  const event = reg ? db.events.find((e) => e.id === reg.eventId) : undefined;
  const cert = reg ? getCertificateFor(reg.id) : undefined;

  if (!reg || !event) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-5 py-28 text-center">
          <p className="font-display text-2xl text-ink">未找到该报名记录</p>
          <p className="mt-2 text-sm text-muted-foreground">请核对报名号，或到「我的报名」用手机号查询。</p>
          <Link to="/my" className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm text-primary-foreground">
            查询我的报名
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const safeReg = reg;
  const safeEvent = event;
  const ticket = event.ticketTypes.find((t) => t.id === reg.ticketTypeId);
  const pending = reg.status === "pending";
  const invalid = reg.status === "rejected" || reg.status === "cancelled";
  const canClaimCert = reg.status === "approved" && !!reg.checkedInAt;

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`${label} 已复制`),
      () => toast.error("复制失败，请手动选择"),
    );
  }

  function addToCalendar() {
    const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MeetingFlow//CN",
      "BEGIN:VEVENT",
      `UID:${safeReg.code}@meetingflow`,
      `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(safeEvent.startAt)}`,
      `DTEND:${dt(safeEvent.endAt)}`,
      `SUMMARY:${safeEvent.title}`,
      `LOCATION:${safeEvent.city} ${safeEvent.venue}`,
      `DESCRIPTION:报名号 ${safeReg.code}，凭电子票二维码签到。`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeEvent.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("日程文件已生成");
  }

  function claimCert() {
    const c = issueCertificate(safeReg.id);
    if (!c) {
      toast.error("暂不符合签发条件：需完成现场签到");
      return;
    }
    toast.success(`证书已签发：${c.certNo}`);
    downloadCertificate({
      name: c.name,
      eventTitle: c.eventTitle,
      certNo: c.certNo,
      issuedAt: new Date(c.issuedAt).toISOString().slice(0, 10),
      organizer: safeEvent.organizer,
      dateText: fmtDate(safeEvent.startAt).replace(/\s/g, ""),
      templateId: c.templateId,
    });
  }

  const certPayload = {
    name: reg.name,
    eventTitle: event.title,
    certNo: cert?.certNo ?? "",
    issuedAt: new Date(cert?.issuedAt ?? Date.now()).toISOString().slice(0, 10),
    organizer: event.organizer,
    dateText: fmtDate(event.startAt).replace(/\s/g, ""),
    templateId: event.certTemplateId,
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[880px] px-5 pt-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" />
          返回活动日历
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          <span
            className={cn(
              "grid size-14 place-items-center rounded-full",
              pending ? "bg-amber-50 text-amber-600" : invalid ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
            )}
          >
            {pending ? <Clock3 className="size-7" /> : invalid ? <XCircle className="size-7" /> : <CheckCircle2 className="size-7" />}
          </span>
          <h1 className="mt-5 font-display text-3xl text-ink">
            {pending ? "报名已提交，等待审核" : invalid ? "该报名已失效" : "报名成功"}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {pending
              ? "主办方将在 1 个工作日内完成审核，结果短信通知。审核通过后凭下方二维码签到。"
              : invalid
                ? "该报名已被取消或未通过审核，如需参会请联系主办方重新报名。"
                : `电子票已生成，请于 ${fmtDate(event.startAt)} 提前 30 分钟到场签到。`}
          </p>
        </div>

        {/* ticket */}
        <div className="mx-auto mt-8 max-w-[600px] overflow-hidden rounded-[24px] border border-border bg-card shadow-lift">
          <div className="relative overflow-hidden bg-primary px-7 py-7 text-primary-foreground">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.35em] text-white/55">ADMISSION TICKET</p>
                  <h2 className="mt-3 font-display text-2xl leading-snug">{event.title}</h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-xs text-gold-soft">
                  {new Date(event.startAt).getFullYear().toString().slice(2)}
                </span>
              </div>

              <div className="mt-7 grid gap-3 text-xs text-white/75 sm:grid-cols-2">
                <span className="num inline-flex items-center gap-1.5">
                  <CalendarPlus className="size-3.5 opacity-70" />
                  {fmtRange(event.startAt, event.endAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 opacity-70" />
                  {event.city} · {event.venue.split("·")[0].trim()}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center">
            <span className="absolute -left-2.5 size-5 rounded-full bg-background" />
            <div className="flex w-full items-center gap-3 border-y border-dashed border-border px-6 py-2.5">
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground">MR. / MS.</span>
              <span className="font-display text-sm text-ink">{reg.name}</span>
              <span className="ml-auto truncate text-[11px] text-muted-foreground">{reg.org}</span>
            </div>
            <span className="absolute -right-2.5 size-5 rounded-full bg-background" />
          </div>

          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-7">
            <div className="rounded-2xl border border-border bg-white p-3 shadow-xs">
              <QrCode value={`MF|${reg.code}|${event.id}`} size={150} />
            </div>
            <div className="w-full flex-1 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-muted-foreground">报名号</p>
                  <p className="num mt-1 font-display text-2xl tracking-wide text-ink">{reg.code}</p>
                </div>
                <RegStatusBadge status={reg.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground">票种</p>
                  <p className="mt-0.5 text-ink">{ticket?.name ?? "标准票"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">金额</p>
                  <p className="num mt-0.5 text-ink">{money(ticket?.price ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">签到时间</p>
                  <p className="mt-0.5 text-ink">{reg.checkedInAt ? fmtTime(reg.checkedInAt) : "未签到"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">签到通道</p>
                  <p className="mt-0.5 text-ink">{event.requireApproval ? "审核通道" : "快速通道"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copy(reg.code, "报名号")}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <ClipboardCopy className="size-3.5" />
                复制报名号
              </button>
            </div>
          </div>
        </div>

        {/* next steps */}
        <div className="mx-auto mt-6 grid max-w-[600px] gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={addToCalendar}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card text-xs text-ink transition-colors hover:border-primary/30 hover:text-primary"
          >
            <CalendarPlus className="size-3.5" />
            加入我的日历
          </button>
          <Link
            to="/my"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card text-xs text-ink transition-colors hover:border-primary/30 hover:text-primary"
          >
            <ClipboardCopy className="size-3.5" />
            我的全部报名
          </Link>
        </div>

        {/* certificate */}
        {event.certEnabled && (
          <div className="mx-auto mt-8 max-w-[600px] rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft/60 text-gold">
                <BadgeCheck className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] text-ink">参会证书</p>
                {cert ? (
                  <>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      证书已签发（编号 <span className="num">{cert.certNo}</span>），可在会务通证书中心验真。
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadCertificate(certPayload)}
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Download className="size-3.5" />
                        下载证书
                      </button>
                      <button
                        type="button"
                        onClick={() => printCertificate(certPayload)}
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 text-xs text-ink transition-colors hover:border-primary/30"
                      >
                        <Printer className="size-3.5" />
                        打印 / 存为 PDF
                      </button>
                      <Link
                        to={`/verify/${cert.certNo}`}
                        className="inline-flex h-9 items-center rounded-full px-3 text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        查看验真页
                      </Link>
                    </div>
                  </>
                ) : canClaimCert ? (
                  <>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      已完成签到，证书条件已满足，可立即签发并下载。
                    </p>
                    <button
                      type="button"
                      onClick={claimCert}
                      className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Download className="size-3.5" />
                      获取参会证书
                    </button>
                  </>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {reg.checkedInAt
                      ? "证书由主办方在会后统一签发，请稍后回到本页查看。"
                      : "完成现场签到后即可下载电子证书。"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-[600px] pb-20 text-center">
          {reg.status === "approved" && !reg.checkedInAt && (
            <button
              type="button"
              onClick={() => {
                setRegStatus(reg.id, "cancelled");
                toast.success("报名已取消，席位已释放");
              }}
              className="cursor-pointer text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-rose-600 hover:underline"
            >
              无法出席？取消报名
            </button>
          )}
          <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
            报名号与二维码是唯一签到凭证，请勿转发他人。
            <br />
            如需修改信息，请联系 {event.organizer}。
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
