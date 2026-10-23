import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-[#0F1B2D] text-white/70 no-print">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <BrandMark to="/" tone="light" />
          <p className="text-xs leading-relaxed text-white/50">
            从报名、审核、签到到证书签发，一站式会务管理平台。为高校、学会与机构提供可追溯的会议全流程。
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-display text-sm tracking-widest text-gold-soft">参会者</p>
          <Link to="/" className="block text-white/60 transition-colors hover:text-white">活动日历</Link>
          <Link to="/my" className="block text-white/60 transition-colors hover:text-white">报名查询</Link>
          <Link to="/verify" className="block text-white/60 transition-colors hover:text-white">证书验真</Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-display text-sm tracking-widest text-gold-soft">主办方</p>
          <Link to="/admin" className="block text-white/60 transition-colors hover:text-white">工作台</Link>
          <Link to="/admin/events" className="block text-white/60 transition-colors hover:text-white">活动管理</Link>
          <Link to="/admin/certificates" className="block text-white/60 transition-colors hover:text-white">证书中心</Link>
          <Link to="/admin/checkin" className="block text-white/60 transition-colors hover:text-white">现场签到台</Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-display text-sm tracking-widest text-gold-soft">服务</p>
          <p className="text-white/60">工作日 09:00 – 18:00</p>
          <p className="num text-white/60">400-800-2026</p>
          <p className="text-white/60">service@meetingflow.cn</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-5 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 会务通 MeetingFlow · 演示环境，数据仅保存在本机浏览器</p>
          <p className="tracking-widest">报名 · 签到 · 证书</p>
        </div>
      </div>
    </footer>
  );
}
