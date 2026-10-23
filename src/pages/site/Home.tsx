import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ClipboardCheck, Download, QrCode as QrIcon, ScanLine } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventCard } from "@/components/EventCard";
import { QrCode } from "@/components/QrCode";
import { useDB, registeredCount } from "@/lib/store";
import { fmtDateShort, fmtTime, fmtWeekday } from "@/lib/format";
import { useState } from "react";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "全部活动" },
  { key: "open", label: "报名中" },
  { key: "ended", label: "已结束" },
] as const;

const steps = [
  { icon: ClipboardCheck, no: "01", title: "在线报名", desc: "选择票种、填写信息，需审核的活动提交后等待主办方确认。" },
  { icon: QrIcon, no: "02", title: "获得电子票", desc: "审核通过即生成专属签到码，短信与邮件同步送达。" },
  { icon: ScanLine, no: "03", title: "现场签到", desc: "出示二维码，签到台一秒核验，同步记录入场时间。" },
  { icon: Download, no: "04", title: "下载证书", desc: "完成议程后自动签发参会证书，支持高清 PNG 与打印。" },
];

export function Home() {
  const db = useDB();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");

  const totalRegs = db.registrations.filter((r) => r.status !== "cancelled").length;
  const events = db.events.filter((e) => e.status !== "draft");
  const upcoming = events.filter((e) => e.status === "open").length;
  const visible = events
    .filter((e) => (filter === "all" ? true : filter === "open" ? e.status === "open" : e.status === "ended"))
    .slice()
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const featured = events.find((e) => e.status === "open")!;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 size-[520px] rounded-full border border-gold/15" />
        <div className="pointer-events-none absolute -left-24 top-32 size-[360px] rounded-full border border-gold/10" />
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              高校 · 学会 · 机构 会务协作平台
            </div>

            <h1 className="mt-6 font-display text-[2.6rem] leading-[1.18] text-ink sm:text-5xl lg:text-[3.4rem]">
              一场会，
              <br />
              从报名到证书，
              <br />
              <span className="relative inline-block">
                都该是体面的
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-gold/70 via-gold/35 to-transparent" />
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-[1.85] text-muted-foreground">
              报名表单、资格审核、电子签到、证书签发，四件事原本散落在表格与邮件里。
              会务通把它们收进一条可追溯的流程，让主办方少打二十个电话，让参会者只记住一件事：准时到场。
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to={`/events/${featured.slug}`}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-lift"
              >
                浏览近期活动
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/my"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm text-ink transition-colors hover:border-primary/30 hover:text-primary"
              >
                查询我的报名
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/80 pt-6">
              {[
                { k: "进行中活动", v: upcoming },
                { k: "累计报名", v: totalRegs },
                { k: "已签发证书", v: db.certificates.length },
              ].map((s) => (
                <div key={s.k}>
                  <dd className="num font-display text-3xl text-ink">{String(s.v).padStart(2, "0")}</dd>
                  <dt className="mt-1.5 text-xs text-muted-foreground">{s.k}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* ticket visual */}
          <div className="relative mx-auto w-full max-w-[420px] lg:mx-0">
            <div className="absolute -left-6 -top-6 hidden size-28 rotate-[-8deg] items-center justify-center rounded-full border-2 border-dashed border-gold/40 text-[10px] tracking-[0.3em] text-gold/70 sm:flex">
              已验票
            </div>
            <div className="absolute -right-4 bottom-6 hidden h-24 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:block" />

            <div className="animate-floaty overflow-hidden rounded-[22px] border border-border bg-card shadow-lift">
              <div className="bg-primary p-6 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.35em] text-white/55">ELECTRONIC TICKET</p>
                    <p className="mt-3 font-display text-xl leading-snug">{featured.title}</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/50 text-[10px] text-gold-soft">
                    26
                  </span>
                </div>
                <div className="mt-6 flex items-end justify-between text-xs text-white/70">
                  <span className="num">
                    {fmtDateShort(featured.startAt)} {fmtWeekday(featured.startAt)} · {fmtTime(featured.startAt)}
                  </span>
                  <span>{featured.city}</span>
                </div>
              </div>

              <div className="relative flex items-center">
                <span className="absolute -left-2.5 size-5 rounded-full bg-background" />
                <div className="w-full border-y border-dashed border-border/90 px-6 py-2 text-[10px] tracking-[0.25em] text-muted-foreground">
                  ADMIT ONE · 参会凭证
                </div>
                <span className="absolute -right-2.5 size-5 rounded-full bg-background" />
              </div>

              <div className="flex items-center gap-5 p-6">
                <div className="rounded-xl border border-border/70 bg-white p-2">
                  <QrCode value="MF|demo|digital-campus-2026" size={112} />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] tracking-widest text-muted-foreground">报名号</p>
                    <p className="num mt-1 font-display text-lg text-ink">MF261008</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest text-muted-foreground">席位</p>
                    <p className="mt-1 text-sm text-ink">嘉宾票 · A 区</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    已确认 · 可签到
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-[11px] text-muted-foreground backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" /> 距离开幕 {Math.max(0, Math.ceil((new Date(featured.startAt).getTime() - Date.now()) / 86400000))} 天
              </span>
              <span className="tracking-widest">MEETINGFLOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* events */}
      <section className="mx-auto max-w-[1240px] px-5">
        <div className="flex flex-col gap-5 border-t border-border/80 pt-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-gold">AGENDA 2026</p>
            <h2 className="mt-3 font-display text-3xl text-ink">近期活动</h2>
            <p className="mt-2 text-sm text-muted-foreground">选一场值得请假的会，剩下的交给我们。</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs transition-colors",
                  filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e, i) => (
            <EventCard
              key={e.id}
              event={e}
              registered={registeredCount(e.id)}
              className="animate-rise"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            该分类下暂无活动
          </div>
        )}
      </section>

      {/* flow */}
      <section className="mx-auto mt-20 max-w-[1240px] px-5">
        <div className="overflow-hidden rounded-[26px] border border-border bg-card shadow-card">
          <div className="flex flex-col gap-4 border-b border-border/70 px-7 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.35em] text-gold">WORKFLOW</p>
              <h2 className="mt-3 font-display text-2xl text-ink">参会者的四个动作，主办方的零次追问</h2>
            </div>
            <Link
              to="/admin"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-border px-4 text-xs text-ink transition-colors hover:border-primary/30 hover:text-primary"
            >
              主办公视角
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {steps.map((s) => (
              <div key={s.no} className="group relative p-7 transition-colors hover:bg-secondary/40">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/[0.06] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="size-[18px]" />
                  </span>
                  <span className="font-display text-2xl text-border">{s.no}</span>
                </div>
                <h3 className="mt-5 font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* admin callout */}
      <section className="mx-auto mt-16 max-w-[1240px] px-5">
        <div className="relative overflow-hidden rounded-[26px] bg-[#0F1B2D] px-7 py-10 text-white sm:px-12 sm:py-14">
          <div className="paper-grain pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-gold/25" />
          <div className="pointer-events-none absolute -right-6 -top-10 size-52 rounded-full border border-gold/15" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] tracking-[0.35em] text-gold-soft">FOR ORGANIZERS</p>
              <h2 className="mt-4 font-display text-3xl leading-snug sm:text-[2.1rem]">
                名单、签到率、证书发放，
                <br className="hidden sm:block" />
                一屏看完，一次做完。
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                批量审核报名、现场核验签到、一键为达标参会者签发证书。所有操作留痕，可随时导出。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-soft px-6 text-sm font-medium text-[#3A2B08] transition-colors hover:bg-white"
              >
                进入工作台
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/admin/checkin"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5"
              >
                打开签到台
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
