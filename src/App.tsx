import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Home } from "@/pages/site/Home";
import { EventDetail } from "@/pages/site/EventDetail";
import { Register } from "@/pages/site/Register";
import { TicketPage } from "@/pages/site/Ticket";
import { MyRegistrations } from "@/pages/site/MyRegistrations";
import { Verify } from "@/pages/site/Verify";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Events } from "@/pages/admin/Events";
import { EventManage } from "@/pages/admin/EventManage";
import { Certificates } from "@/pages/admin/Certificates";
import { CheckIn } from "@/pages/admin/CheckIn";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/events/:slug/register" element={<Register />} />
        <Route path="/ticket/:code" element={<TicketPage />} />
        <Route path="/my" element={<MyRegistrations />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certNo" element={<Verify />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventManage />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="checkin" element={<CheckIn />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" toastOptions={{ style: { fontSize: 13 } }} />
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <div className="text-center">
        <p className="font-display text-6xl text-primary/20">404</p>
        <h1 className="mt-4 font-display text-2xl text-ink">页面走丢了</h1>
        <p className="mt-2 text-sm text-muted-foreground">你访问的地址不存在，回到活动日历继续浏览。</p>
        <a
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
