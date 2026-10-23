import { NavLink, Link, Outlet } from "react-router-dom";
import { Award, CalendarDays, LayoutDashboard, RotateCcw, ScanLine, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { resetDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "工作台", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "活动管理", icon: CalendarDays },
  { to: "/admin/certificates", label: "证书中心", icon: Award },
  { to: "/admin/checkin", label: "现场签到台", icon: ScanLine },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#0F1B2D] text-white/70 lg:flex">
        <div className="px-6 pb-8 pt-7">
          <BrandMark to="/admin" tone="light" />
          <p className="mt-4 text-[10px] tracking-[0.3em] text-white/35">ORGANIZER CONSOLE</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white/90",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("size-4", isActive ? "text-gold-soft" : "text-white/40")} />
                  {item.label}
                  {isActive && <span className="ml-auto size-1.5 rounded-full bg-gold" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 px-3 pb-5">
          <button
            type="button"
            onClick={() => {
              resetDemo();
              toast.success("演示数据已重置");
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80"
          >
            <RotateCcw className="size-4" />
            重置演示数据
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl border border-white/10 px-3.5 py-2.5 text-[13px] text-white/60 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowUpRight className="size-4" />
            返回参会者站点
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold/20 font-display text-xs text-gold-soft">
              主办
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-white/85">会务通 · 会务组</p>
              <p className="truncate text-[10px] text-white/35">admin@meetingflow.cn</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        {/* mobile nav */}
        <div className="sticky top-0 z-20 border-b border-border bg-[#0F1B2D] px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <BrandMark to="/admin" compact tone="light" />
            <button
              type="button"
              onClick={() => {
                resetDemo();
                toast.success("演示数据已重置");
              }}
              className="cursor-pointer text-[11px] text-white/50"
            >
              重置数据
            </button>
          </div>
          <div className="scrollbar-thin -mx-1 mt-3 flex gap-1 overflow-x-auto px-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[11px] transition-colors",
                    isActive ? "bg-white/15 text-white" : "text-white/50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
