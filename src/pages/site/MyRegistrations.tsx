import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Download, MapPin, Search, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegStatusBadge } from "@/components/StatusBadge";
import { useDB, myCodes } from "@/lib/store";
import { fmtRange } from "@/lib/format";
import { downloadCertificate } from "@/lib/certificate";
import { fmtDate } from "@/lib/format";

export function MyRegistrations() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);

  const localRegs = useMemo(() => {
    const codes = myCodes();
    return codes
      .map((c) => db.registrations.find((r) => r.code === c))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
  }, [db.registrations]);

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hits = db.registrations
      .filter(
        (r) =>
          r.code.toLowerCase() === q ||
          r.phone === q ||
          r.email.toLowerCase() === q ||
          (q.length > 1 && r.name.includes(query.trim())),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setResults(hits.map((r) => r.id));
    setSearched(true);
  }

  const list = results ? db.registrations.filter((r) => results.includes(r.id)) : localRegs;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[900px] px-5 pb-24 pt-12">
        <p className="text-[11px] tracking-[0.35em] text-gold">MY REGISTRATIONS</p>
        <h1 className="mt-3 font-display text-3xl text-ink">我的报名</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          本机报名记录会自动出现在下方；换设备时可用报名号、手机号或邮箱查询。
        </p>

        <form onSubmit={doSearch} className="mt-7 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="报名号 / 手机号 / 邮箱 / 姓名"
              className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-full bg-primary px-6 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            查询报名
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {results ? `查询到 ${list.length} 条记录` : `本机记录 ${localRegs.length} 条`}
          </p>
          {results && (
            <button
              onClick={() => {
                setResults(null);
                setSearched(false);
                setQuery("");
              }}
              className="cursor-pointer text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              重置
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {list.map((reg) => {
            const event = db.events.find((e) => e.id === reg.eventId);
            const cert = db.certificates.find((c) => c.registrationId === reg.id);
            if (!event) return null;
            return (
              <div
                key={reg.id}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <RegStatusBadge status={reg.status} />
                      <span className="text-[11px] text-muted-foreground">{event.category}</span>
                      {cert && (
                        <span className="rounded-full bg-gold-soft/60 px-2 py-0.5 text-[10px] text-[#7A5C15]">
                          证书已签发
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/events/${event.slug}`}
                      className="mt-2.5 block font-display text-[17px] leading-snug text-ink transition-colors hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                      <span className="num inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {fmtRange(event.startAt, event.endAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {event.city} · {event.venue.split("·")[0].trim()}
                      </span>
                      <span className="num inline-flex items-center gap-1">
                        <Ticket className="size-3.5" />
                        {reg.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {cert ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadCertificate({
                            name: reg.name,
                            eventTitle: event.title,
                            certNo: cert.certNo,
                            issuedAt: new Date(cert.issuedAt).toISOString().slice(0, 10),
                            organizer: event.organizer,
                            dateText: fmtDate(event.startAt).replace(/\s/g, ""),
                            templateId: cert.templateId,
                          })
                        }
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Download className="size-3.5" />
                        下载证书
                      </button>
                    ) : null}
                    <Link
                      to={`/ticket/${reg.code}`}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-xs text-ink transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      电子票
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Ticket className="size-5" />
            </span>
            <p className="mt-4 font-display text-lg text-ink">{searched ? "没有匹配的报名记录" : "本机还没有报名记录"}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {searched ? "请确认报名号或手机号是否正确；若通过其他手机号报名，请用该号码查询。" : "浏览活动日历，选一场活动完成报名后，记录会出现在这里。"}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
            >
              浏览活动
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
