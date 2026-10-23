import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div>
        {eyebrow && <p className="text-[10px] tracking-[0.35em] text-gold">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-[26px] leading-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5",
        accent ? "border-transparent bg-[#0F1B2D] text-white" : "border-border bg-card shadow-card",
      )}
    >
      <div className="flex items-start justify-between">
        <p className={cn("text-[11px] tracking-wide", accent ? "text-white/50" : "text-muted-foreground")}>{label}</p>
        {icon && <span className={cn(accent ? "text-gold-soft/70" : "text-muted-foreground/60")}>{icon}</span>}
      </div>
      <p className={cn("num mt-3 font-display text-[28px] leading-none", accent ? "text-white" : "text-ink")}>
        {value}
      </p>
      {hint && <p className={cn("mt-2 text-[11px]", accent ? "text-white/40" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}
