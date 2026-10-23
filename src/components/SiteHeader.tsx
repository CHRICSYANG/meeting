import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "活动日历", exact: true },
  { to: "/my", label: "我的报名" },
  { to: "/verify", label: "证书验真" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 no-print">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex h-16 items-center gap-4 rounded-2xl border border-border/80 bg-background/80 px-4 shadow-xs backdrop-blur-xl sm:px-5">
          <BrandMark />

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-primary/[0.08] font-medium text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-ink",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-ink transition-colors hover:border-primary/30 hover:text-primary sm:inline-flex"
            >
              <ShieldCheck className="size-3.5" />
              主办方后台
            </Link>
            <button
              type="button"
              aria-label={open ? "关闭菜单" : "打开菜单"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid size-9 cursor-pointer place-items-center rounded-full border border-border text-ink transition-colors hover:bg-secondary md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="animate-rise mt-2 overflow-hidden rounded-2xl border bg-card p-2 shadow-lift md:hidden">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-xl px-4 py-3 text-sm transition-colors",
                    isActive ? "bg-primary/[0.08] font-medium text-primary" : "text-muted-foreground hover:bg-secondary",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground"
            >
              <ShieldCheck className="size-4" />
              进入主办方后台
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
