export type EventStatus = "draft" | "open" | "closed" | "ended";
export type RegStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quota: number;
  note: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
  kind?: "签到" | "主旨" | "对话" | "茶歇" | "工作坊" | "闭幕";
}

export interface Speaker {
  name: string;
  role: string;
  org: string;
}

export type CoverTone = "ink" | "teal" | "brick" | "slate";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tone: CoverTone;
  startAt: string;
  endAt: string;
  venue: string;
  city: string;
  address: string;
  organizer: string;
  capacity: number;
  status: EventStatus;
  requireApproval: boolean;
  certEnabled: boolean;
  certTemplateId: string;
  summary: string;
  description: string[];
  highlights: string[];
  agenda: AgendaItem[];
  speakers: Speaker[];
  ticketTypes: TicketType[];
}

export interface Registration {
  id: string;
  code: string;
  eventId: string;
  name: string;
  phone: string;
  email: string;
  org: string;
  title: string;
  ticketTypeId: string;
  status: RegStatus;
  createdAt: string;
  reviewedAt?: string;
  checkedInAt?: string;
  certNo?: string;
  note?: string;
  source: "online" | "onsite";
}

export interface Certificate {
  id: string;
  certNo: string;
  registrationId: string;
  eventId: string;
  name: string;
  eventTitle: string;
  issuedAt: string;
  templateId: string;
}

export interface CertTemplate {
  id: string;
  name: string;
  tone: "classic" | "modern" | "minimal";
  description: string;
}

export interface DB {
  events: EventItem[];
  registrations: Registration[];
  certificates: Certificate[];
  templates: CertTemplate[];
}
