import { ArrowDownLeft, Plus, Shield, TrendingUp, Eye, EyeOff, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import DealCard from "@/components/DealCard";
import { dealsApi, type DealDto } from "@/lib/api";
import { mapDealStatusToUi, toUiDealView } from "@/lib/deal-status";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [deals, setDeals] = useState<DealDto[]>([]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const nextDeals = await dealsApi.list(user?.userId ?? "");
        setDeals(nextDeals);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Не удалось загрузить сделки");
      }
    };
    void loadDeals();
  }, [user?.userId]);

  const activeDeals = useMemo(() => deals.filter((d) => [1, 2, 3, 4, 7].includes(d.status)).slice(0, 4), [deals]);

  return (
    <div className="min-h-dvh bg-background pb-nav">
      {/* Balance Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gradient-dark px-5 pt-safe pb-7 rounded-b-[2rem]"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-white/60">Общий баланс</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/notifications")}
              className="text-white/50 hover:text-white/90 transition-colors p-1.5 relative"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-status-danger rounded-full" />
            </button>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white/50 hover:text-white/80 transition-colors p-1"
              aria-label="Показать или скрыть баланс"
            >
              {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[2.5rem] font-extrabold tracking-tight text-white mb-4 font-mono"
        >
          {balanceVisible ? "$2,450.00" : "••••••"}
        </motion.h1>
        <div className="flex gap-8 mb-6">
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Доступно</p>
            <p className="text-base font-bold text-white mt-0.5">
              {balanceVisible ? "$1,650" : "••••"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Заморожено</p>
            <p className="text-base font-bold text-status-pending mt-0.5">
              {balanceVisible ? "$800" : "••••"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Сделки</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-status-safe" />
              <p className="text-base font-bold text-status-safe">+12%</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 gradient-brand text-brand-foreground font-semibold py-3.5 rounded-2xl shadow-brand transition-all active:scale-[0.97]">
            <Plus className="w-4 h-4" />
            Пополнить
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] hover:bg-white/15">
            <ArrowDownLeft className="w-4 h-4" />
            Вывести
          </button>
        </div>
      </motion.div>

      {/* Create Deal CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 py-5"
      >
        <button
          onClick={() => navigate("/create")}
          className="w-full flex items-center justify-center gap-3 bg-card text-card-foreground font-bold py-4 rounded-2xl text-lg transition-all active:scale-[0.98] shadow-card hover:shadow-card-hover border border-border"
        >
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
            <Shield className="w-5 h-5 text-brand-foreground" />
          </div>
          Создать сделку
        </button>
      </motion.div>

      {/* Deals List */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Активные сделки</h2>
          <button onClick={() => navigate("/deals")} className="text-sm text-brand font-medium">
            Все →
          </button>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {activeDeals.map((deal) => {
            const uiDeal = toUiDealView(deal, user?.userId ?? "");
            return (
            <motion.div key={deal.id} variants={item}>
              <DealCard
                title={uiDeal.title}
                amount={uiDeal.amount}
                counterparty={uiDeal.counterparty}
                status={uiDeal.status}
                statusLabel={uiDeal.statusLabel}
                role={uiDeal.role}
                onClick={() => navigate(`/deal/${deal.id}`)}
              />
            </motion.div>
          );})}
          {activeDeals.length === 0 && (
            <p className="text-sm text-muted-foreground">Пока нет активных договоров. Создайте первую сделку.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
