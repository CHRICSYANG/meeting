import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Users } from "lucide-react";
import { EventCover } from "./EventCover";
import { EventStatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { fmtDateShort, fmtWeekday, money, relativeDeadline } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export function EventCard({
  event,
  registered,
  className,
  style,
}: {
  event: EventItem;
  registered: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const pct = Math.min(100, Math.round((registered / Math.max(1, event.capacity)) * 100));
  const lowest = event.ticketTypes.reduce((m, t) => Math.min(m, t.price), Number.POSITIVE_INFINITY);

  return (
    <Link
      to={`/events/${event.slug}`}
      style={style}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      <div className="relative">
        <EventCover event={event} className="h-40" compact />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm">
            {fmtDateShort(event.startAt)} · {fmtWeekday(event.startAt)}
          </span>
        </div>
        <div className="absolute bottom-3 right-4">
          <EventStatusBadge status={event.status} className="border-white/40 bg-white/90 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[19px] leading-snug text-ink transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{event.subtitle}</p>

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {event.city} · {event.venue.split("·")[0].trim()}
            </span>
            <span className="num inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {registered}/{event.capacity}
            </span>
            <span className="ml-auto text-ink/80">{money(lowest)} 起</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              style={{ width: `${Math.max(pct, 3)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{pct >= 85 ? "即将满席" : `余位 ${Math.max(0, event.capacity - registered)}`}</span>
            <span>{relativeDeadline(event.startAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
