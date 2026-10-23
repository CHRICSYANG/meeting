import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  compact = false,
  to = "/",
  tone = "dark",
}: {
  className?: string;
  compact?: boolean;
  to?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link to={to} className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-[11px] bg-primary text-primary-foreground shadow-sm transition-colors group-hover:bg-primary/90">
        <span className="absolute inset-[3px] rounded-[8px] border border-gold/45" />
        <span className="font-display text-[15px] leading-none">会</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[17px] tracking-[0.12em]",
              tone === "light" ? "text-white" : "text-ink",
            )}
          >
            会务通
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] tracking-[0.3em]",
              tone === "light" ? "text-white/40" : "text-muted-foreground",
            )}
          >
            MEETINGFLOW
          </span>
        </span>
      )}
    </Link>
  );
}
