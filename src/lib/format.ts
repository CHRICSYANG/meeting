const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function toDate(iso: string) {
  return new Date(iso);
}

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function fmtWeekday(iso: string) {
  return WEEK[new Date(iso).getDay()];
}

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) return `${fmtDate(startIso)} ${fmtTime(startIso)} – ${fmtTime(endIso)}`;
  return `${fmtDate(startIso)} – ${fmtDate(endIso)}`;
}

export function fmtStamp(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function fmtDateTime(iso: string) {
  return `${fmtStamp(iso)} ${fmtTime(iso)}`;
}

export function money(price: number) {
  return price === 0 ? "免费" : `¥ ${price.toLocaleString("zh-CN")}`;
}

export function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function relativeDeadline(iso: string) {
  const d = daysUntil(iso);
  if (d < 0) return "已结束";
  if (d === 0) return "今天";
  if (d === 1) return "明天";
  return `还有 ${d} 天`;
}
