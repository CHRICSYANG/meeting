import { useSyncExternalStore } from "react";
import type {
  CertTemplate,
  Certificate,
  DB,
  EventItem,
  RegStatus,
  Registration,
} from "./types";

const KEY = "meetingflow.db.v1";
const MY_KEY = "meetingflow.mine.v1";

const templates: CertTemplate[] = [
  {
    id: "tpl-classic",
    name: "典藏 · 金线",
    tone: "classic",
    description: "双线金框、宋体标题，适合学术论坛与结业证书。",
  },
  {
    id: "tpl-modern",
    name: "格物 · 极简",
    tone: "modern",
    description: "左侧色块 + 大留白，适合工作坊与短期研修。",
  },
  {
    id: "tpl-minimal",
    name: "素白 · 细框",
    tone: "minimal",
    description: "单线细框、居中排版，打印友好、成本最低。",
  },
];

/* ------------------------------------------------------------------ seeds */

const speakers = {
  forum: [
    { name: "陈望舒", role: "教授 · 教育技术研究所", org: "华东师范大学" },
    { name: "林书言", role: "首席信息官", org: "浙江大学" },
    { name: "周牧之", role: "副院长", org: "中国教育科学研究院" },
    { name: "苏晚晴", role: "产品负责人", org: "未来课堂实验室" },
  ],
  workshop: [
    { name: "许知远", role: "AI 教学设计师", org: "教师发展中心" },
    { name: "沈砚", role: "副教授", org: "南京大学" },
  ],
  young: [
    { name: "顾清和", role: "教学名师", org: "复旦大学" },
    { name: "叶南舟", role: "教师发展中心主任", org: "上海交通大学" },
  ],
  campus: [
    { name: "宋亦寒", role: "信息化办公室主任", org: "同济大学" },
    { name: "白露", role: "智慧校园架构师", org: "腾讯教育" },
  ],
};

function baseEvent(e: Partial<EventItem> & Pick<EventItem, "id" | "slug" | "title" | "startAt" | "endAt">): EventItem {
  return {
    subtitle: "",
    category: "论坛",
    tone: "ink",
    venue: "国际会议中心",
    city: "杭州",
    address: "西湖区文三路 88 号",
    organizer: "会务通 · 高校数字化协作组",
    capacity: 200,
    status: "open",
    requireApproval: false,
    certEnabled: true,
    certTemplateId: "tpl-classic",
    summary: "",
    description: [],
    highlights: [],
    agenda: [],
    speakers: [],
    ticketTypes: [
      { id: "std", name: "标准票", price: 0, quota: 200, note: "含资料与茶歇" },
    ],
    ...e,
  };
}

function seedEvents(): EventItem[] {
  return [
    baseEvent({
      id: "evt-forum",
      slug: "digital-campus-2026",
      title: "2026 高校数字化转型高峰论坛",
      subtitle: "从系统上线到教学现场：数字化的最后一公里",
      category: "高峰论坛",
      tone: "ink",
      startAt: "2026-11-08T09:00:00+08:00",
      endAt: "2026-11-08T17:30:00+08:00",
      venue: "国际会议中心 · 主会场 A 座",
      city: "杭州",
      address: "西湖区文三路 88 号 国际会议中心 3 层",
      capacity: 320,
      status: "open",
      summary:
        "面向高校信息化负责人、教务管理者与一线教师，围绕数据治理、智慧教学场景与 AI 助教落地展开一天的深度讨论。",
      description: [
        "当数字化从「平台建设」进入「教学现场」，真正的挑战不再是系统是否上线，而是教师愿意用、学生用得顺、数据能够回流。本届论坛以「最后一公里」为题，把镜头对准课堂、对准流程、对准人。",
        "论坛设一场主旨报告、两场平行分论坛与一场圆桌对话，并首次开放「数字化场景诊所」，由专家现场为参会院校的诊断材料给出改进建议。",
      ],
      highlights: [
        "12 场主题报告，覆盖教务、学工、科研三类核心场景",
        "现场发布《高校数字化成熟度观察报告 2026》",
        "数字化场景诊所：携带材料可获 20 分钟一对一诊断",
        "全程同声传译，提供电子会议手册",
      ],
      agenda: [
        { time: "08:30", title: "签到与资料领取", kind: "签到" },
        { time: "09:00", title: "开幕致辞：数字化的下一站", speaker: "周牧之", kind: "主旨" },
        { time: "09:30", title: "主旨报告：从数据孤岛到教学决策", speaker: "陈望舒", kind: "主旨" },
        { time: "10:40", title: "茶歇与展区交流", kind: "茶歇" },
        { time: "11:00", title: "分论坛 A：智慧教务的流程再造", speaker: "林书言", kind: "对话" },
        { time: "12:00", title: "自助午餐", kind: "茶歇" },
        { time: "13:30", title: "分论坛 B：AI 助教进课堂的边界", speaker: "苏晚晴", kind: "对话" },
        { time: "15:00", title: "圆桌：谁来为数字化买单", speaker: "全体嘉宾", kind: "对话" },
        { time: "16:30", title: "闭幕与优秀案例颁证", kind: "闭幕" },
      ],
      speakers: speakers.forum,
      ticketTypes: [
        { id: "std", name: "标准票", price: 0, quota: 220, note: "含全天议程、资料与茶歇" },
        { id: "vip", name: "嘉宾票", price: 680, quota: 60, note: "前排席位 + 午餐 + 报告纸质版" },
        { id: "online", name: "线上直播票", price: 0, quota: 500, note: "会后 30 天回放" },
      ],
    }),
    baseEvent({
      id: "evt-workshop",
      slug: "ai-teaching-workshop",
      title: "AI 赋能教学创新工作坊",
      subtitle: "两小时，把一个真实课程单元改成 AI 协作版本",
      category: "工作坊",
      tone: "teal",
      startAt: "2026-10-30T13:30:00+08:00",
      endAt: "2026-10-30T17:00:00+08:00",
      venue: "教师发展中心 · 研讨室 204",
      city: "上海",
      address: "杨浦区邯郸路 220 号 教师发展中心 2 层",
      capacity: 60,
      status: "open",
      requireApproval: true,
      certTemplateId: "tpl-modern",
      summary:
        "小班制实操工作坊，带着你的课程大纲来，带着一份可执行的 AI 协作教学设计走。需审核通过后获得席位。",
      description: [
        "这不是一场讲 AI 有多强的报告。我们把参与者按学科分组，每组配一位教学设计师，用两小时完成「拆解—重构—试讲—复盘」四步。",
        "为保证实操质量，本场限 60 人，报名后由教务组审核学科匹配度，通过后短信通知。",
      ],
      highlights: ["小班实操，1 位导师带 10 人", "现场产出可直接使用的教学设计单", "提供 30 天线上答疑"],
      agenda: [
        { time: "13:00", title: "签到与分组", kind: "签到" },
        { time: "13:30", title: "拆解：找到课程中的 AI 切入点", speaker: "许知远", kind: "工作坊" },
        { time: "14:40", title: "重构：设计人机协作任务链", speaker: "沈砚", kind: "工作坊" },
        { time: "16:00", title: "试讲与互评", kind: "工作坊" },
        { time: "16:40", title: "复盘与证书发放说明", kind: "闭幕" },
      ],
      speakers: speakers.workshop,
      ticketTypes: [
        { id: "onsite", name: "线下实操票", price: 0, quota: 60, note: "需审核 · 含教具与茶歇" },
      ],
    }),
    baseEvent({
      id: "evt-young",
      slug: "young-faculty-2026",
      title: "青年教师教学能力提升研修班",
      subtitle: "三天集训：教学设计、课堂表达与教学反思",
      category: "研修班",
      tone: "brick",
      startAt: "2026-09-18T09:00:00+08:00",
      endAt: "2026-09-20T16:30:00+08:00",
      venue: "学术交流中心 · 报告厅",
      city: "南京",
      address: "鼓楼区汉口路 22 号 学术交流中心",
      capacity: 120,
      status: "ended",
      certTemplateId: "tpl-classic",
      summary:
        "面向入职三年内青年教师的系统研修，完成全部课程与教学展示者可获得结业证书。",
      description: [
        "研修班采用「工作坊 + 微格教学 + 一对一反馈」的方式，帮助青年教师在三日内完成一次完整的教学设计迭代。",
        "结业要求：出勤率不低于 90%，并完成 15 分钟微格教学展示。",
      ],
      highlights: ["三天封闭式研修", "微格教学录像与逐条反馈", "结业证书可用于校内教学培训学时认定"],
      agenda: [
        { time: "09:00", title: "开班与教学诊断", speaker: "顾清和", kind: "主旨" },
        { time: "13:30", title: "教学设计工作坊（一）", kind: "工作坊" },
        { time: "09:00", title: "课堂表达与提问技巧", speaker: "叶南舟", kind: "工作坊" },
        { time: "14:00", title: "微格教学与互评", kind: "工作坊" },
        { time: "09:30", title: "教学反思报告与结业", kind: "闭幕" },
      ],
      speakers: speakers.young,
      ticketTypes: [{ id: "std", name: "研修席位", price: 0, quota: 120, note: "校内推荐制" }],
    }),
    baseEvent({
      id: "evt-campus",
      slug: "smart-campus-2026",
      title: "第八届智慧校园建设研讨会",
      subtitle: "空间、能耗与安全：校园数字底座的下一轮升级",
      category: "研讨会",
      tone: "slate",
      startAt: "2026-12-12T09:00:00+08:00",
      endAt: "2026-12-12T16:30:00+08:00",
      venue: "科技会堂 · 多功能厅",
      city: "深圳",
      address: "南山区科苑南路 9 号 科技会堂",
      capacity: 260,
      status: "open",
      certTemplateId: "tpl-minimal",
      summary: "聚焦校园物联网、能耗管理与应急联动，分享 8 个已落地的一线案例。",
      description: [
        "智慧校园进入「运营期」，建设期的清单思维正在失效。本届研讨会只讲已经跑起来的系统：跑了多久、踩过什么坑、每年省下多少。",
        "会议同期设置小型展区，展示 12 家校内外服务商的轻量化方案。",
      ],
      highlights: ["8 个已落地案例复盘", "校园能耗与安全联合专场", "展区一对一方案沟通"],
      agenda: [
        { time: "09:00", title: "签到", kind: "签到" },
        { time: "09:30", title: "主旨：校园数字底座的运营视角", speaker: "宋亦寒", kind: "主旨" },
        { time: "11:00", title: "案例专场：能耗与安全联动", speaker: "白露", kind: "对话" },
        { time: "14:00", title: "展区巡览与自由交流", kind: "茶歇" },
        { time: "15:30", title: "圆桌与闭幕", kind: "闭幕" },
      ],
      speakers: speakers.campus,
      ticketTypes: [
        { id: "std", name: "标准票", price: 0, quota: 200, note: "含资料与午餐" },
        { id: "vendor", name: "服务商票", price: 1200, quota: 30, note: "含展位洽谈资格" },
      ],
    }),
    baseEvent({
      id: "evt-draft",
      slug: "affairs-training-2026",
      title: "会务与后勤保障实务培训",
      subtitle: "从预算编制到现场应急的 12 个标准动作",
      category: "培训",
      tone: "ink",
      startAt: "2026-11-22T09:00:00+08:00",
      endAt: "2026-11-22T16:00:00+08:00",
      venue: "行政楼 · 第一会议室",
      city: "杭州",
      address: "西湖区文三路 88 号 行政楼 5 层",
      capacity: 80,
      status: "draft",
      certEnabled: false,
      summary: "面向二级单位会务联络人的实务培训，正在完善议程，暂未开放报名。",
      description: ["课程正在排期，预计 11 月初开放报名。"],
      ticketTypes: [{ id: "std", name: "内部席位", price: 0, quota: 80, note: "限额 80 人" }],
    }),
  ];
}

const namePool = [
  "王砚秋", "李知白", "张亦驰", "刘清越", "陈慕之", "杨舒窈", "黄廷玉", "赵行舟",
  "吴予安", "周与同", "徐南枝", "孙照野", "朱砚书", "胡其琛", "郭文茵", "何见山",
  "罗青禾", "高听澜", "林岫", "郑叙白", "梁怀瑾", "谢知微", "唐既明", "韩照临",
  "沈栖迟", "程砚之", "陆聆溪", "方与之", "蒋允中", "邹清晏",
];

const orgPool = [
  "华东师范大学 · 教务处",
  "浙江大学 · 信息技术中心",
  "南京大学 · 教师发展中心",
  "上海交通大学 · 教育技术中心",
  "同济大学 · 信息化办公室",
  "东南大学 · 网络与信息中心",
  "浙江工业大学 · 教务处",
  "苏州大学 · 教学评估处",
  "深圳大学 · 智慧校园办",
  "南京师范大学 · 教育科学学院",
  "杭州电子科技大学 · 信息中心",
  "宁波大学 · 现代教育技术中心",
];

const titlePool = ["教务处副处长", "中心主任", "副教授", "讲师", "信息科科长", "教学秘书", "院长助理", "实验师"];

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function seedRegistrations(events: EventItem[]): Registration[] {
  const plan: { eventId: string; count: number; pending: number; rejected: number; checked: number; cert: number }[] = [
    { eventId: "evt-forum", count: 14, pending: 0, rejected: 1, checked: 0, cert: 0 },
    { eventId: "evt-workshop", count: 9, pending: 3, rejected: 1, checked: 0, cert: 0 },
    { eventId: "evt-young", count: 12, pending: 0, rejected: 0, checked: 9, cert: 7 },
    { eventId: "evt-campus", count: 7, pending: 1, rejected: 0, checked: 0, cert: 0 },
  ];

  const regs: Registration[] = [];
  let n = 1;
  let certIdx = 1;

  plan.forEach((p, pi) => {
    const ev = events.find((e) => e.id === p.eventId)!;
    for (let i = 0; i < p.count; i++) {
      const idx = pi * 7 + i;
      const created = new Date(Date.UTC(2026, 8, 24 + ((pi * 3 + i) % 18), 2 + (i % 9), (i * 13) % 60));
      const status: RegStatus =
        i < p.count - p.pending - p.rejected ? "approved" : i < p.count - p.rejected ? "pending" : "rejected";
      const checked = status === "approved" && i < p.checked;
      const ticket = ev.ticketTypes[i % ev.ticketTypes.length];
      const reg: Registration = {
        id: `reg-${n}`,
        code: `MF26${pad(1000 + n, 4)}`,
        eventId: ev.id,
        name: namePool[idx % namePool.length],
        phone: `138${pad(10000 + idx * 137, 8)}`,
        email: `attendee${n}@univ.edu.cn`,
        org: orgPool[idx % orgPool.length],
        title: titlePool[idx % titlePool.length],
        ticketTypeId: ticket.id,
        status,
        createdAt: created.toISOString(),
        reviewedAt: status === "pending" ? undefined : new Date(created.getTime() + 3_600_000).toISOString(),
        checkedInAt: checked
          ? new Date(`${ev.startAt.slice(0, 10)}T08:${pad(30 + (i % 25), 2)}:00+08:00`).toISOString()
          : undefined,
        source: "online",
        note: i === 2 ? "需要电子版会议手册" : undefined,
      };

      if (checked && i < p.cert) {
        reg.certNo = `MF-2026-${pad(certIdx, 4)}`;
        certIdx += 1;
      }

      regs.push(reg);
      n += 1;
    }
  });

  return regs;
}

function seedDB(): DB {
  const events = seedEvents();
  const registrations = seedRegistrations(events);
  const certificates: Certificate[] = registrations
    .filter((r) => r.certNo)
    .map((r, i) => ({
      id: `cert-${i + 1}`,
      certNo: r.certNo!,
      registrationId: r.id,
      eventId: r.eventId,
      name: r.name,
      eventTitle: events.find((e) => e.id === r.eventId)!.title,
      issuedAt: new Date(`${events.find((e) => e.id === r.eventId)!.endAt.slice(0, 10)}T18:00:00+08:00`).toISOString(),
      templateId: events.find((e) => e.id === r.eventId)!.certTemplateId,
    }));
  return { events, registrations, certificates, templates };
}

/* ------------------------------------------------------------------ store */

function load(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedDB();
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.events?.length) return seedDB();
    parsed.templates = templates;
    return parsed;
  } catch {
    return seedDB();
  }
}

let db: DB = load();
const listeners = new Set<() => void>();

function commit(next: DB) {
  db = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => db, () => db);
}

export function getDB() {
  return db;
}

export function resetDemo() {
  commit(seedDB());
}

/* ---------------------------------------------------------------- helpers */

export function statusOfEvent(e: EventItem): EventStatusLabel {
  if (e.status === "draft") return "草稿";
  if (e.status === "ended") return "已结束";
  if (e.status === "closed") return "报名截止";
  return "报名中";
}

export type EventStatusLabel = "草稿" | "已结束" | "报名截止" | "报名中";

export function registeredCount(eventId: string) {
  return db.registrations.filter((r) => r.eventId === eventId && r.status !== "cancelled" && r.status !== "rejected").length;
}

export function checkedInCount(eventId: string) {
  return db.registrations.filter((r) => r.eventId === eventId && r.checkedInAt).length;
}

export function certificateCount(eventId: string) {
  return db.certificates.filter((c) => c.eventId === eventId).length;
}

export function getEvent(idOrSlug: string) {
  return db.events.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
}

export function getRegistrations(eventId: string) {
  return db.registrations
    .filter((r) => r.eventId === eventId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findByCode(code: string) {
  return db.registrations.find((r) => r.code.toLowerCase() === code.trim().toLowerCase());
}

export function lookupRegistrations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return db.registrations
    .filter(
      (r) =>
        r.code.toLowerCase() === q ||
        r.phone === q ||
        r.email.toLowerCase() === q ||
        (q.length > 2 && r.name.includes(query.trim())),
    )
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCertificateFor(regId: string) {
  return db.certificates.find((c) => c.registrationId === regId);
}

export function getCertificateByNo(certNo: string) {
  return db.certificates.find((c) => c.certNo.toLowerCase() === certNo.trim().toLowerCase());
}

/* ---------------------------------------------------------------- actions */

export interface RegisterInput {
  eventId: string;
  name: string;
  phone: string;
  email: string;
  org: string;
  title: string;
  ticketTypeId: string;
  note?: string;
}

export function registerForEvent(input: RegisterInput): Registration {
  const event = getEvent(input.eventId);
  if (!event) throw new Error("活动不存在");
  if (event.status !== "open") throw new Error("该活动当前未开放报名");
  if (registeredCount(event.id) >= event.capacity) throw new Error("席位已满，请联系主办方");
  const dup = db.registrations.find(
    (r) => r.eventId === event.id && r.phone === input.phone && r.status !== "cancelled",
  );
  if (dup) throw new Error(`该手机号已报名，报名号 ${dup.code}`);

  const maxNo = db.registrations.reduce((m, r) => Math.max(m, Number(r.code.slice(-4)) || 0), 1000);
  const reg: Registration = {
    id: `reg-${Date.now()}`,
    code: `MF26${pad(maxNo + 1, 4)}`,
    eventId: event.id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    org: input.org.trim(),
    title: input.title.trim(),
    ticketTypeId: input.ticketTypeId,
    status: event.requireApproval ? "pending" : "approved",
    createdAt: new Date().toISOString(),
    source: "online",
    note: input.note?.trim() || undefined,
  };
  commit({ ...db, registrations: [reg, ...db.registrations] });
  rememberCode(reg.code);
  return reg;
}

export function setRegStatus(regId: string, status: RegStatus) {
  commit({
    ...db,
    registrations: db.registrations.map((r) =>
      r.id === regId
        ? {
            ...r,
            status,
            reviewedAt: status === "approved" || status === "rejected" ? new Date().toISOString() : r.reviewedAt,
          }
        : r,
    ),
  });
}

export function bulkApprove(eventId: string): number {
  let count = 0;
  const registrations = db.registrations.map((r) => {
    if (r.eventId === eventId && r.status === "pending") {
      count += 1;
      return { ...r, status: "approved" as RegStatus, reviewedAt: new Date().toISOString() };
    }
    return r;
  });
  if (count) commit({ ...db, registrations });
  return count;
}

export function checkIn(codeOrPhone: string, eventId?: string): {
  ok: boolean;
  message: string;
  registration?: Registration;
} {
  const q = codeOrPhone.trim().toLowerCase();
  const reg = db.registrations.find(
    (r) =>
      (r.code.toLowerCase() === q || r.phone === q || r.name === codeOrPhone.trim()) &&
      (!eventId || r.eventId === eventId),
  );
  if (!reg) return { ok: false, message: "未找到报名记录，请核对报名号或手机号" };
  if (reg.status === "pending") return { ok: false, message: "报名待审核，暂不可签到", registration: reg };
  if (reg.status === "rejected" || reg.status === "cancelled") {
    return { ok: false, message: "该报名已失效，请到人工通道处理", registration: reg };
  }
  if (reg.checkedInAt) return { ok: true, message: "已签到，无需重复操作", registration: reg };

  const updated = { ...reg, checkedInAt: new Date().toISOString() };
  commit({
    ...db,
    registrations: db.registrations.map((r) => (r.id === reg.id ? updated : r)),
  });
  return { ok: true, message: "签到成功，欢迎入场", registration: updated };
}

export function issueCertificate(regId: string): Certificate | null {
  const reg = db.registrations.find((r) => r.id === regId);
  if (!reg) return null;
  if (!reg.checkedInAt) return null;
  const existing = db.certificates.find((c) => c.registrationId === regId);
  if (existing) return existing;
  const event = getEvent(reg.eventId);
  if (!event || !event.certEnabled) return null;

  const maxNo = db.certificates.reduce((m, c) => {
    const v = Number(c.certNo.split("-").pop());
    return Number.isFinite(v) ? Math.max(m, v) : m;
  }, 0);
  const certNo = `MF-2026-${pad(maxNo + 1, 4)}`;
  const cert: Certificate = {
    id: `cert-${Date.now()}`,
    certNo,
    registrationId: reg.id,
    eventId: reg.eventId,
    name: reg.name,
    eventTitle: event.title,
    issuedAt: new Date().toISOString(),
    templateId: event.certTemplateId,
  };
  commit({
    ...db,
    certificates: [cert, ...db.certificates],
    registrations: db.registrations.map((r) => (r.id === regId ? { ...r, certNo } : r)),
  });
  return cert;
}

export function issueAllForEvent(eventId: string): number {
  const targets = db.registrations.filter(
    (r) => r.eventId === eventId && r.checkedInAt && !db.certificates.some((c) => c.registrationId === r.id),
  );
  let count = 0;
  targets.forEach((r) => {
    if (issueCertificate(r.id)) count += 1;
  });
  return count;
}

export function revokeCertificate(certId: string) {
  const cert = db.certificates.find((c) => c.id === certId);
  if (!cert) return;
  commit({
    ...db,
    certificates: db.certificates.filter((c) => c.id !== certId),
    registrations: db.registrations.map((r) => (r.id === cert.registrationId ? { ...r, certNo: undefined } : r)),
  });
}

export function createEvent(input: {
  title: string;
  subtitle: string;
  category: string;
  startAt: string;
  endAt: string;
  venue: string;
  city: string;
  capacity: number;
  requireApproval: boolean;
  certEnabled: boolean;
  summary: string;
  tone: EventItem["tone"];
}): EventItem {
  const id = `evt-${Date.now()}`;
  const event: EventItem = baseEvent({
    id,
    slug: `event-${Date.now()}`,
    title: input.title,
    subtitle: input.subtitle,
    category: input.category || "论坛",
    tone: input.tone,
    startAt: input.startAt,
    endAt: input.endAt,
    venue: input.venue,
    city: input.city,
    address: `${input.city} · ${input.venue}`,
    capacity: input.capacity || 100,
    status: "open",
    requireApproval: input.requireApproval,
    certEnabled: input.certEnabled,
    certTemplateId: "tpl-classic",
    summary: input.summary,
    description: input.summary ? [input.summary] : [],
  });
  commit({ ...db, events: [event, ...db.events] });
  return event;
}

export function updateEvent(id: string, patch: Partial<EventItem>) {
  commit({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
}

/* ------------------------------------------------------------ my records */

export function rememberCode(code: string) {
  try {
    const raw = window.localStorage.getItem(MY_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    if (!codes.includes(code)) {
      window.localStorage.setItem(MY_KEY, JSON.stringify([code, ...codes].slice(0, 20)));
    }
  } catch {
    /* ignore */
  }
}

export function myCodes(): string[] {
  try {
    const raw = window.localStorage.getItem(MY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
