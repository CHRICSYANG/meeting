import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Award, CheckCircle2, CircleAlert, Plus, Users } from "lucide-react";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { EventStatusBadge, RegStatusBadge } from "@/components/StatusBadge";
import { useDB } from "@/lib/store";
import { fmtDateShort, fmtDateTime } from "@/lib/format";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(38 16% 88%)",
  boxShadow: "0 12px 32px -18px rgba(22,35,63,.35)",
  fontSize: 12,
  padding: "8px 12px",
};

export function Dashboard() {
  const db = useDB();
  const events = db.events.filter((e) => e.status !== "draft");
  const regs = db.registrations.filter((r) => r.status !== "cancelled");

  const approved = regs.filter((r) => r.status === "approved");
  const pending = regs.filter((r) => r.status === "pending");
  const checked = regs.filter((r) => r.checkedInAt);
  const checkRate = approved.length ? Math.round((checked.length / approved.length) * 100) : 0;
  const pendingCerts = checked.filter((r) => !db.certificates.some((c) => c.registrationId === r.id));

  const chartData = events.slice(0, 5).map((e) => {
    const list = db.registrations.filter((r) => r.eventId === e.id && r.status !== "rejected");
    return {
      name: e.title.replace(/^20\d\d\s*/, "").slice(0, 8),
      报名: list.length,
      签到: list.filter((r) => r.checkedInAt).length,
    };
  });

  const pieData = [
    { name: "已通过", value: approved.length, color: "#17306E" },
    { name: "待审核", value: pending.length, color: "#C9A24A" },
    { name: "未通过", value: regs.filter((r) => r.status === "rejected").length, color: "#D6D3CB" },
  ].filter((d) => d.value > 0);

  const recentCerts = db.certificates.slice().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, 4);

  return (
    <div>
      <AdminPageHeader
        eyebrow="OVERVIEW"
        title="工作台"
        description="今天是会务组的工作日。先处理待审核报名，再确认可签发证书的名单。"
        actions={
          <>
            <span className="num hidden rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground sm:inline-flex">
              2026.10.23 · 周五
            </span>
            <Link
              to="/admin/events"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              新建活动
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="进行中活动"
          value={events.filter((e) => e.status === "open").length}
          hint={`共 ${db.events.length} 场，含草稿`}
          accent
          icon={<CircleAlert className="size-4" />}
        />
        <StatCard
          label="有效报名"
          value={regs.length}
          hint={`${pending.length} 条待审核`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="平均签到率"
          value={`${checkRate}%`}
          hint={`${checked.length} 人已签到`}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="已签发证书"
          value={db.certificates.length}
          hint={`${pendingCerts.length} 人可补发`}
          icon={<Award className="size-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-ink">各活动报名与签到</p>
              <p className="mt-1 text-[11px] text-muted-foreground">按活动维度对比，签到人数越接近报名人数说明执行越稳。</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#17306E]" />
                报名
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#C9A24A]" />
                签到
              </span>
            </div>
          </div>
          <div className="mt-4 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={6} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(38 16% 92%)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(220 12% 45%)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220 12% 45%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(23,48,110,0.04)" }} />
                <Bar dataKey="报名" fill="#17306E" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="签到" fill="#C9A24A" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-[13px] text-ink">报名状态构成</p>
          <p className="mt-1 text-[11px] text-muted-foreground">待审核占比过高时，建议开启批量审核。</p>
          <div className="mt-2 h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-[11px]">
                <span className="size-2 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="num ml-auto text-ink">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-[13px] text-ink">待审核报名</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{pending.length} 条等待处理</p>
            </div>
            <Link to="/admin/events" className="text-[11px] text-muted-foreground transition-colors hover:text-primary">
              去处理
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {pending.slice(0, 5).map((r) => {
              const ev = db.events.find((e) => e.id === r.eventId);
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-[11px] text-ink">
                    {r.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-ink">
                      {r.name}
                      <span className="ml-2 text-[10px] text-muted-foreground">{r.org}</span>
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{ev?.title}</p>
                  </div>
                  <RegStatusBadge status={r.status} />
                </div>
              );
            })}
            {pending.length === 0 && (
              <p className="px-5 py-10 text-center text-xs text-muted-foreground">全部处理完毕</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-[13px] text-ink">最近签发证书</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">编号唯一，可在线验真</p>
            </div>
            <Link to="/admin/certificates" className="text-[11px] text-muted-foreground transition-colors hover:text-primary">
              证书中心
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {recentCerts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-soft/50 text-gold">
                  <Award className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">{c.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{c.eventTitle}</p>
                </div>
                <div className="text-right">
                  <p className="num text-[10px] text-ink">{c.certNo}</p>
                  <p className="num mt-0.5 text-[10px] text-muted-foreground">{fmtDateTime(c.issuedAt)}</p>
                </div>
              </div>
            ))}
            {recentCerts.length === 0 && (
              <p className="px-5 py-10 text-center text-xs text-muted-foreground">暂无签发记录</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <p className="text-[13px] text-ink">活动一览</p>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            全部活动
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="divide-y divide-border/60">
          {db.events.map((e) => {
            const list = db.registrations.filter((r) => r.eventId === e.id);
            const checkedIn = list.filter((r) => r.checkedInAt).length;
            const certs = db.certificates.filter((c) => c.eventId === e.id).length;
            return (
              <Link
                key={e.id}
                to={`/admin/events/${e.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{e.title}</p>
                  <p className="num mt-0.5 text-[10px] text-muted-foreground">
                    {fmtDateShort(e.startAt)} · {e.city} · {e.venue.split("·")[0].trim()}
                  </p>
                </div>
                <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
                  <span className="num">
                    报名 <span className="text-ink">{list.length}</span>
                  </span>
                  <span className="num">
                    签到 <span className="text-ink">{checkedIn}</span>
                  </span>
                  <span className="num">
                    证书 <span className="text-ink">{certs}</span>
                  </span>
                </div>
                <EventStatusBadge status={e.status} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
