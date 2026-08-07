import { ArrowLeft, ChevronDown, MoreVertical, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
import { useEffect, useMemo, useState } from "react";
import { dealsApi, type DealDto } from "@/lib/api";
import { mapDealStatusToUi } from "@/lib/deal-status";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const steps = ["Оплата", "Заморожено", "Выполнено", "Выплата"];

const DealScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [deal, setDeal] = useState<DealDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeal = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const currentDeal = await dealsApi.getById(id, user?.userId ?? "");
      setDeal(currentDeal);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить сделку");
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchDeal();
  }, [id, user?.userId]);

  const currentStep = useMemo(() => {
    if (!deal) return 0;
    return mapDealStatusToUi(deal.status).step;
  }, [deal]);

  const uiStatus = useMemo(
    () => (deal ? mapDealStatusToUi(deal.status) : { status: "pending" as const, label: "Загрузка", step: 0 }),
    [deal]
  );

  const isBuyer = deal?.buyerId === user?.userId;
  const isSeller = deal?.sellerId === user?.userId;
  const roleLabel = isBuyer ? "Покупатель" : isSeller ? "Продавец" : "Наблюдатель";
  const availableActions = useMemo(() => {
    if (!deal) return [];
    const actions: string[] = [];
    if (deal.status === 1 && isSeller) actions.push("Принять сделку");
    if (deal.status === 3 && isSeller) actions.push("Отметить выполненной");
    if (deal.status === 4 && isBuyer) actions.push("Подтвердить");
    if ((deal.status === 3 || deal.status === 4) && isBuyer) actions.push("Открыть спор");
    return actions;
  }, [deal, isBuyer, isSeller]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    if (!deal) return;
    try {
      await action();
      toast.success(successMessage);
      await fetchDeal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка выполнения действия");
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Загрузка сделки...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-5 text-center">
        <div>
          <p className="text-card-foreground font-semibold mb-2">Сделка не найдена</p>
          <button onClick={() => navigate("/deals")} className="text-brand text-sm font-semibold">
            Вернуться к списку сделок
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-6 flex flex-col">
      {/* Header */}
      <div className="gradient-dark px-5 pt-safe pb-5 rounded-b-[1.5rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-white">{deal.title}</h1>
          <StatusBadge status={uiStatus.status} label={uiStatus.label} />
        </div>
        <p className="text-sm text-white/50">{isBuyer ? `@${deal.sellerId.slice(0, 8)}` : `@${deal.buyerId.slice(0, 8)}`}</p>
      </div>

      {/* Money Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 py-4"
      >
        <div className="bg-card rounded-2xl p-5 shadow-card">
          {/* Steps */}
          <div className="flex items-center justify-between mb-3 relative">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1 z-10">
                <div className={`w-8 h-8 rounded-full mb-1.5 flex items-center justify-center text-[10px] font-bold transition-all ${
                  i < currentStep
                    ? "gradient-brand text-brand-foreground shadow-brand"
                    : i === currentStep
                    ? "bg-brand text-brand-foreground animate-pulse-soft shadow-brand"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-medium text-center ${
                  i <= currentStep ? "text-brand font-semibold" : "text-muted-foreground"
                }`}>{step}</span>
              </div>
            ))}
          </div>
          {/* Progress line */}
          <div className="relative h-1.5 bg-secondary rounded-full mb-5 mx-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 0.5) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute h-1.5 gradient-brand rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-sunken rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Сумма</p>
              <p className="font-bold text-card-foreground font-mono">
                {deal.currency === "usd" ? "$" : ""}{Number(deal.amount).toLocaleString()}
              </p>
            </div>
            <div className="bg-surface-sunken rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Комиссия</p>
              <p className="font-bold text-card-foreground font-mono">
                {deal.currency === "usd" ? "$" : ""}{(Number(deal.amount) * 0.02).toFixed(2)}
              </p>
            </div>
            <div className="bg-status-safe-muted rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Статус</p>
              <p className="font-semibold text-status-safe text-sm">{uiStatus.label}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-3"
      >
        <button
          onClick={() => setConditionsOpen(!conditionsOpen)}
          className="w-full flex items-center justify-between bg-card rounded-2xl p-4 shadow-card"
        >
          <span className="font-semibold text-card-foreground">Условия сделки</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${conditionsOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {conditionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-b-2xl px-4 pb-4 -mt-2 space-y-3 pt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Описание</p>
                  <p className="text-sm text-card-foreground mt-0.5">{deal.description}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Срок</p>
                  <p className="text-sm text-card-foreground mt-0.5">—</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Файлы</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-secondary rounded-lg px-3 py-1.5 text-xs text-muted-foreground">📄 ТЗ_сайт.pdf</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="px-5 mb-3">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/70">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Текущая роль</p>
          <p className="text-sm font-semibold text-card-foreground">{roleLabel}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-3 mb-1">Доступные действия</p>
          {availableActions.length > 0 ? (
            <p className="text-sm text-card-foreground">{availableActions.join(" / ")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">На этом шаге для вашей роли действий нет.</p>
          )}
        </div>
      </div>

      <div className="px-5 mb-3">
        <button
          onClick={() => navigate(`/chat/${deal.id}`)}
          className="w-full bg-card rounded-2xl p-4 shadow-card border border-border/70 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-semibold text-card-foreground">Чат по сделке</p>
            <p className="text-sm text-muted-foreground mt-0.5">Открыть переписку и доказательства</p>
          </div>
          <MessageCircle className="w-5 h-5 text-brand" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-5 flex gap-3">
        {deal.status === 1 && isSeller && (
          <button
            onClick={() => runAction(() => dealsApi.accept(deal.id, user?.userId ?? ""), "Сделка принята")}
            className="flex-1 gradient-brand text-brand-foreground font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-brand"
          >
            Принять сделку
          </button>
        )}
        {deal.status === 3 && isSeller && (
          <button
            onClick={() => runAction(() => dealsApi.markDone(deal.id, user?.userId ?? ""), "Работа отмечена как выполненная")}
            className="flex-1 gradient-brand text-brand-foreground font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-brand"
          >
            Отметить выполненной
          </button>
        )}
        {deal.status === 4 && isBuyer && (
          <button
            onClick={() => runAction(() => dealsApi.confirm(deal.id, user?.userId ?? "", Number(deal.amount) * 0.02), "Сделка подтверждена")}
            className="flex-1 gradient-brand text-brand-foreground font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-brand"
          >
            Подтвердить
          </button>
        )}
        {(deal.status === 3 || deal.status === 4) && isBuyer && (
          <button
            onClick={() => runAction(() => dealsApi.dispute(deal.id, user?.userId ?? ""), "Спор открыт")}
            className="flex-1 bg-status-danger-muted text-status-danger font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] border border-status-danger/20"
          >
            Открыть спор
          </button>
        )}
      </div>
    </div>
  );
};

export default DealScreen;
