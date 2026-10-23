import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

const tones: Record<EventItem["tone"], { bg: string; glow: string; mark: string }> = {
  ink: { bg: "#17306E", glow: "#2A4C9B", mark: "壹" },
  teal: { bg: "#0F4B45", glow: "#1A6F65", mark: "贰" },
  brick: { bg: "#71392E", glow: "#96503F", mark: "叁" },
  slate: { bg: "#2A3346", glow: "#44506B", mark: "肆" },
};

export function EventCover({
  event,
  className,
  compact = false,
}: {
  event: EventItem;
  className?: string;
  compact?: boolean;
}) {
  const tone = tones[event.tone];
  const year = new Date(event.startAt).getFullYear().toString().slice(2);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor: tone.bg }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 82% 18%, ${tone.glow} 0%, transparent 55%), radial-gradient(circle at 12% 92%, rgba(255,255,255,0.10) 0%, transparent 45%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: compact ? "28px 28px" : "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-black/25 to-transparent" />

      <span className="absolute -bottom-8 right-2 font-display text-[7.5rem] leading-none text-white/[0.09] select-none">
        {tone.mark}
      </span>

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] tracking-[0.2em] text-white/85">
            {event.category}
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 font-display text-xs text-gold-soft">
            {year}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.42em] text-white/55">
            {event.city} · {event.venue.split("·")[0].trim()}
          </span>
          <svg width="40" height="16" viewBox="0 0 40 16" className="shrink-0 opacity-60">
            <path d="M0 15 L12 1 L40 1" stroke="#C9A24A" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
