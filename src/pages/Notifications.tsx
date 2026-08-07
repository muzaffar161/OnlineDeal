import { Bell, Check, DollarSign, MessageCircle, AlertTriangle, Shield } from "lucide-react";
import { motion } from "framer-motion";

const notifications = [
  { id: 1, text: "Сделка «Разработка сайта» создана", time: "2 мин назад", read: false, icon: Shield, color: "text-brand" },
  { id: 2, text: "Продавец @designer_pro принял сделку", time: "15 мин назад", read: false, icon: Check, color: "text-status-safe" },
  { id: 3, text: "Средства $800 заморожены", time: "15 мин назад", read: false, icon: DollarSign, color: "text-status-pending" },
  { id: 4, text: "Новое сообщение в сделке «SEO-аудит»", time: "1 час назад", read: true, icon: MessageCircle, color: "text-muted-foreground" },
  { id: 5, text: "Сделка «Копирайтинг» завершена", time: "3 часа назад", read: true, icon: Check, color: "text-muted-foreground" },
  { id: 6, text: "Открыт спор по сделке «Мобильное приложение»", time: "5 часов назад", read: true, icon: AlertTriangle, color: "text-muted-foreground" },
];

const Notifications = () => {
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="min-h-dvh bg-background pb-nav">
      <div className="bg-card px-5 pt-safe pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-card-foreground">Уведомления</h1>
          {unread.length > 0 && (
            <span className="bg-brand text-brand-foreground text-xs font-bold px-2.5 py-1 rounded-full">
              {unread.length}
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-4">
        {unread.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Новые</p>
            <div className="space-y-2 mb-6">
              {unread.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl px-4 py-4 flex items-start gap-3 shadow-card border-l-4 border-l-brand"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {read.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ранее</p>
            <div className="space-y-2">
              {read.map((n) => (
                <div
                  key={n.id}
                  className="bg-card rounded-2xl px-4 py-3.5 flex items-start gap-3 opacity-70"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <n.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
