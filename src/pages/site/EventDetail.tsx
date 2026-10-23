import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventCover } from "@/components/EventCover";
import { EventStatusBadge } from "@/components/StatusBadge";
import { useDB, registeredCount } from "@/lib/store";
import { fmtDate, fmtRange, fmtWeekday, money, relativeDeadline } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EventDetail() {
  const { slug = "" } = useParams();
  const db = useDB();
  const event = db.events.find((e) => e.slug === slug || e.id === slug);

  if (!event) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-5 py-28 text-center">
          <p className="font-display text-2xl text-ink">活动不存在或已下线</p>
          <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm text-primary-foreground">
            返回活动日历
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const registered = registeredCount(event.id);
  const left = Math.max(0, event.capacity - registered);
  const full = registered >= event.capacity;
  const open = event.status === "open" && !full;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[1240px] px-5 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          返回活动日历
        </Link>

        <div className="mt-5 overflow-hidden rounded-[26px] border border-border bg-card shadow-card">
          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <div className="relative order-2 p-7 sm:p-10 lg:order-1">
              <div className="flex flex-wrap items-center gap-2">
                <EventStatusBadge status={event.status} />
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {event.category}
                </span>
                {event.requireApproval && (
                  <span className="rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-800">
                    需主办方审核
                  </span>
                )}
                {event.certEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] text-emerald-800">
                    <BadgeCheck className="size-3" />
                    提供参会证书
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-display text-3xl leading-[1.35] text-ink sm:text-[2.4rem]">{event.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{event.subtitle}</p>

              <div className="mt-8 grid gap-4 border-t border-border/80 pt-7 sm:grid-cols-2">
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.06] text-primary">
                    <CalendarDays className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground">时间</p>
                    <p className="num mt-1 text-sm text-ink">{fmtRange(event.startAt, event.endAt)}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtWeekday(event.startAt)} · 全天</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.06] text-primary">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground">地点</p>
                    <p className="mt-1 text-sm text-ink">{event.venue}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{event.address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.06] text-primary">
                    <Users className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground">席位</p>
                    <p className="num mt-1 text-sm text-ink">
                      {registered} / {event.capacity} 人已报名
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{full ? "席位已满" : `仅剩 ${left} 席`}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.06] text-primary">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground">主办方</p>
                    <p className="mt-1 text-sm text-ink">{event.organizer}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">会务咨询 · service@meetingflow.cn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <EventCover event={event} className="h-44 sm:h-56 lg:h-full lg:min-h-[380px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pt-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl text-ink">关于这场活动</h2>
            <div className="mt-4 space-y-4 text-[14px] leading-[1.95] text-muted-foreground">
              {event.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {event.highlights.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg text-ink">参会收获</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {event.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl text-ink">会议议程</h2>
              <span className="num text-xs text-muted-foreground">{fmtDate(event.startAt)}</span>
            </div>
            <ol className="mt-6 space-y-0">
              {event.agenda.map((item, i) => (
                <li key={`${item.time}-${item.title}`} className="group relative flex gap-5 pb-7 last:pb-0">
                  {i < event.agenda.length - 1 && (
                    <span className="absolute left-[52px] top-6 h-full w-px bg-border" />
                  )}
                  <span className="num w-11 shrink-0 pt-0.5 text-right text-[13px] text-muted-foreground">{item.time}</span>
                  <span
                    className={cn(
                      "relative mt-1.5 size-2.5 shrink-0 rounded-full border-2 bg-background",
                      item.kind === "主旨"
                        ? "border-primary"
                        : item.kind === "工作坊"
                          ? "border-gold"
                          : "border-border",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-ink">{item.title}</p>
                      {item.kind && item.kind !== "签到" && (
                        <span className="rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground">
                          {item.kind}
                        </span>
                      )}
                    </div>
                    {item.speaker && <p className="mt-1 text-xs text-muted-foreground">{item.speaker}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {event.speakers.length > 0 && (
            <section>
              <h2 className="font-display text-xl text-ink">主讲与嘉宾</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/[0.07] font-display text-lg text-primary">
                      {s.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[15px] text-ink">{s.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.role}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-dashed border-border p-6">
            <h2 className="font-display text-lg text-ink">参会须知</h2>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
              <li>· 报名成功后凭报名号与二维码签到，请提前 30 分钟到场。</li>
              <li>· {event.requireApproval ? "本场活动需审核，通过后席位方生效。" : "本场活动报名即确认席位，无需审核。"}</li>
              <li>· 证书需完成签到并在议程结束后申请，仅发放给实际参会者。</li>
              <li>· 如需变更或取消报名，请联系主办方或在「我的报名」中操作。</li>
            </ul>
          </section>
        </div>

        {/* sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="border-b border-border/70 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-lg text-ink">选择票种</p>
                <span className="num text-xs text-muted-foreground">{relativeDeadline(event.startAt)}</span>
              </div>
              <div className="mt-4 space-y-2">
                {event.ticketTypes.map((t, i) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border px-3.5 py-3",
                      i === 0 ? "border-primary/30 bg-primary/[0.04]" : "border-border",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="size-3.5 text-primary" />
                        <p className="text-[13px] text-ink">{t.name}</p>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t.note}</p>
                    </div>
                    <span className="num shrink-0 text-[13px] text-ink">{money(t.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>已报名 {registered} 人</span>
                <span className="num">{Math.round((registered / Math.max(1, event.capacity)) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/55"
                  style={{ width: `${Math.max(3, Math.min(100, (registered / Math.max(1, event.capacity)) * 100))}%` }}
                />
              </div>

              {open ? (
                <Link
                  to={`/events/${event.slug}/register`}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {event.requireApproval ? "提交报名申请" : "立即报名"}
                </Link>
              ) : (
                <div className="flex h-11 w-full items-center justify-center rounded-full bg-secondary text-sm text-muted-foreground">
                  {full ? "席位已满" : event.status === "ended" ? "活动已结束" : "报名已截止"}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <Share2 className="size-3.5" />
                复制活动链接
              </button>

              <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-gold" />
                <span>
                  {event.certEnabled
                    ? "完成签到并在议程结束后，可在「我的报名」下载电子参会证书。"
                    : "本场活动不提供参会证书。"}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted-foreground">
            报名即表示同意主办方收集必要参会信息，仅用于本场会务组织与证书签发。
          </p>
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}
