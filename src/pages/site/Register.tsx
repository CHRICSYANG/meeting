import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, CalendarDays, Check, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerForEvent, useDB } from "@/lib/store";
import { fmtRange, money } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  org?: string;
  agree?: string;
}

export function Register() {
  const { slug = "" } = useParams();
  const db = useDB();
  const navigate = useNavigate();
  const event = db.events.find((e) => e.slug === slug || e.id === slug);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    title: "",
    note: "",
    ticketTypeId: event?.ticketTypes[0]?.id ?? "std",
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-5 py-28 text-center">
          <p className="font-display text-2xl text-ink">活动不存在</p>
          <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm text-primary-foreground">
            返回活动日历
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const ticket = event.ticketTypes.find((t) => t.id === form.ticketTypeId) ?? event.ticketTypes[0];

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "请填写真实姓名（至少 2 个字）";
    if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) next.phone = "请填写 11 位手机号，用于接收签到码";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "邮箱格式不正确";
    if (form.org.trim().length < 2) next.org = "请填写所在单位或学校";
    if (!agree) next.agree = "请阅读并同意信息使用说明";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const reg = registerForEvent({
        eventId: event!.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        org: form.org,
        title: form.title,
        ticketTypeId: form.ticketTypeId,
        note: form.note,
      });
      toast.success(event!.requireApproval ? "报名申请已提交，等待主办方审核" : "报名成功，电子票已生成");
      navigate(`/ticket/${reg.code}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[1060px] px-5 pt-8">
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          返回活动详情
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-gold">REGISTRATION</p>
            <h1 className="mt-3 font-display text-3xl text-ink">填写报名信息</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.requireApproval ? "提交后需主办方审核，结果将以短信通知。" : "提交即锁定席位，请核对信息后提交。"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
              1 填写信息
            </span>
            <span className="h-px w-6 bg-border" />
            <span className="rounded-full border border-border px-2.5 py-1">2 获取电子票</span>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-6 pb-20 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-7">
              <h2 className="font-display text-lg text-ink">参会人信息</h2>
              <p className="mt-1 text-xs text-muted-foreground">证书将按此处的姓名与单位签发，请使用真实信息。</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="姓名" required error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="如：王砚秋"
                    className="h-10 bg-background"
                    autoComplete="name"
                  />
                </Field>
                <Field label="手机号" required error={errors.phone}>
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="11 位手机号"
                    inputMode="numeric"
                    className="num h-10 bg-background tracking-wide"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="邮箱" error={errors.email}>
                  <Input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="用于接收会议材料"
                    className="h-10 bg-background"
                    autoComplete="email"
                  />
                </Field>
                <Field label="所在单位" required error={errors.org}>
                  <Input
                    value={form.org}
                    onChange={(e) => set("org", e.target.value)}
                    placeholder="学校 / 机构 / 公司"
                    className="h-10 bg-background"
                  />
                </Field>
                <Field label="职务 / 职称" className="sm:col-span-2">
                  <Input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="如：教务处副处长、副教授"
                    className="h-10 bg-background"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-7">
              <h2 className="font-display text-lg text-ink">选择票种</h2>
              <div className="mt-5 space-y-3">
                {event.ticketTypes.map((t) => {
                  const active = form.ticketTypeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set("ticketTypeId", t.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors",
                        active
                          ? "border-primary/35 bg-primary/[0.04] ring-1 ring-primary/10"
                          : "border-border hover:border-primary/20 hover:bg-secondary/40",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                            active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                          )}
                        >
                          {active && <Check className="size-2.5" strokeWidth={3} />}
                        </span>
                        <div>
                          <p className="text-sm text-ink">{t.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{t.note}</p>
                        </div>
                      </div>
                      <span className="num shrink-0 text-sm text-ink">{money(t.price)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <Label htmlFor="note" className="text-xs text-muted-foreground">
                  备注（选填）
                </Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="饮食禁忌、无障碍需求、随行人员等"
                  className="mt-2 min-h-[84px] bg-background text-sm"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-7">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setErrors((er) => ({ ...er, agree: undefined }));
                  }}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#17306E]"
                />
                <span className="text-[12px] leading-relaxed text-muted-foreground">
                  我已阅读并同意主办方将上述信息用于本场会务组织、签到核验与证书签发；信息不会用于其他商业用途。
                </span>
              </label>
              {errors.agree && <p className="mt-2 text-[11px] text-destructive">{errors.agree}</p>}
            </section>
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="border-b border-border/70 px-5 py-4">
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground">订单摘要</p>
                <p className="mt-2 font-display text-[15px] leading-snug text-ink">{event.title}</p>
              </div>
              <div className="space-y-3 px-5 py-4 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
                  <span className="num">{fmtRange(event.startAt, event.endAt)}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {event.city} · {event.venue}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
                  <span>{event.certEnabled ? "提供电子参会证书" : "不提供证书"}</span>
                </div>
              </div>
              <div className="border-t border-border/70 px-5 py-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ticket?.name}</span>
                  <span className="num">{money(ticket?.price ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">应付金额</span>
                  <span className="num font-display text-2xl text-ink">{money(ticket?.price ?? 0)}</span>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  {ticket?.price ? "演示环境不实际扣款，提交后即为报名成功。" : "本场活动免费，席位有限请准时出席。"}
                </p>
              </div>
              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full cursor-pointer rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "提交中…" : event.requireApproval ? "提交审核" : "确认报名"}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="size-3" />
                  信息仅用于本次会务
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-1 text-xs text-ink">
        {label}
        {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
