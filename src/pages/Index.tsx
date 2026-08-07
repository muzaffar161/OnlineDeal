import { ArrowDownLeft, Plus, Shield, TrendingUp, Eye, EyeOff, Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import DealCard from "@/components/DealCard";
import { dealsApi, usersApi, walletApi, type DealDto, type UserSearchResultDto, type WalletBalanceDto } from "@/lib/api";
import { toUiDealView } from "@/lib/deal-status";
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

type MoneyModalMode = "topup" | "withdraw" | "transfer" | null;

const formatMoney = (value: number) =>
  `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);
  const [modal, setModal] = useState<MoneyModalMode>(null);
  const [amountInput, setAmountInput] = useState("");
  const [transferQuery, setTransferQuery] = useState("");
  const [transferResults, setTransferResults] = useState<UserSearchResultDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResultDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const next = await walletApi.me();
      setWallet(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить баланс");
    }
  }, []);

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
    void loadWallet();
  }, [user?.userId, loadWallet]);

  useEffect(() => {
    if (modal !== "transfer") return;
    const q = transferQuery.trim();
    if (q.length < 1) {
      setTransferResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void usersApi
        .search(q)
        .then(setTransferResults)
        .catch(() => setTransferResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [transferQuery, modal]);

  const activeDeals = useMemo(() => deals.filter((d) => [1, 2, 3, 4, 7].includes(d.status)).slice(0, 4), [deals]);
  const available = wallet?.availableBalance ?? 0;
  const frozen = wallet?.frozenBalance ?? 0;
  const total = available + frozen;

  const openModal = (mode: Exclude<MoneyModalMode, null>) => {
    setModal(mode);
    setAmountInput("");
    setTransferQuery("");
    setTransferResults([]);
    setSelectedUser(null);
  };

  const submitMoneyAction = async () => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Введите сумму больше 0");
      return;
    }

    setSubmitting(true);
    try {
      if (modal === "topup") {
        const next = await walletApi.topUp(amount);
        setWallet(next);
        toast.success("Баланс пополнен (имитация)");
      } else if (modal === "withdraw") {
        const next = await walletApi.withdraw(amount);
        setWallet(next);
        toast.success("Вывод выполнен (имитация)");
      } else if (modal === "transfer") {
        if (!selectedUser) {
          toast.error("Выберите получателя");
          setSubmitting(false);
          return;
        }
        const next = await walletApi.transfer(selectedUser.userId, amount);
        setWallet(next);
        toast.success(`Перевод @${selectedUser.username} выполнен`);
      }
      setModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Операция не выполнена");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-nav">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gradient-dark px-5 pt-safe pb-7 rounded-b-[2rem]"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-white/60">Общий баланс</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="text-white/50 hover:text-white/90 transition-colors p-1.5 relative"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-status-danger rounded-full" />
            </button>
            <button
              type="button"
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
          {balanceVisible ? formatMoney(total) : "••••••"}
        </motion.h1>
        <div className="flex gap-8 mb-6">
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Доступно</p>
            <p className="text-base font-bold text-white mt-0.5">
              {balanceVisible ? formatMoney(available) : "••••"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Заморожено</p>
            <p className="text-base font-bold text-status-pending mt-0.5">
              {balanceVisible ? formatMoney(frozen) : "••••"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Сделки</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-status-safe" />
              <p className="text-base font-bold text-status-safe">{activeDeals.length}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openModal("topup")}
            className="flex-1 flex items-center justify-center gap-2 gradient-brand text-brand-foreground font-semibold py-3.5 rounded-2xl shadow-brand transition-all active:scale-[0.97] touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            Пополнить
          </button>
          <button
            type="button"
            onClick={() => openModal("transfer")}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] hover:bg-white/15 touch-manipulation"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Перевод
          </button>
        </div>
        <button
          type="button"
          onClick={() => openModal("withdraw")}
          className="w-full mt-3 text-sm text-white/60 hover:text-white/90 transition-colors py-1"
        >
          Вывести средства
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 py-5"
      >
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="w-full flex items-center justify-center gap-3 bg-card text-card-foreground font-bold py-4 rounded-2xl text-lg transition-all active:scale-[0.98] shadow-card hover:shadow-card-hover border border-border touch-manipulation"
        >
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
            <Shield className="w-5 h-5 text-brand-foreground" />
          </div>
          Создать сделку
        </button>
      </motion.div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Активные сделки</h2>
          <button type="button" onClick={() => navigate("/deals")} className="text-sm text-brand font-medium">
            Все →
          </button>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
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
            );
          })}
          {activeDeals.length === 0 && (
            <p className="text-sm text-muted-foreground">Пока нет активных договоров. Создайте первую сделку.</p>
          )}
        </motion.div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-end sm:items-center justify-center px-4 pb-safe">
          <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 shadow-lg border border-border/70 space-y-4 mb-0 sm:mb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-card-foreground">
                {modal === "topup" ? "Пополнение" : modal === "withdraw" ? "Вывод" : "Перевод"}
              </h3>
              <button type="button" onClick={() => setModal(null)} className="p-1 text-muted-foreground" aria-label="Закрыть">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal === "transfer" && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Получатель</label>
                <input
                  value={selectedUser ? `@${selectedUser.username}` : transferQuery}
                  onChange={(e) => {
                    setSelectedUser(null);
                    setTransferQuery(e.target.value);
                  }}
                  placeholder="@username или контакт"
                  className="w-full bg-background rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand"
                />
                {!selectedUser && transferResults.length > 0 && (
                  <div className="bg-background rounded-2xl border border-border overflow-hidden">
                    {transferResults.map((u) => (
                      <button
                        key={u.userId}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setTransferQuery(u.username);
                          setTransferResults([]);
                        }}
                        className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/60"
                      >
                        <p className="text-sm font-semibold text-card-foreground">@{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.contact}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Сумма</label>
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-background rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand font-mono"
              />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitMoneyAction()}
              className="w-full gradient-brand text-brand-foreground font-bold py-3.5 rounded-2xl disabled:opacity-60 touch-manipulation"
            >
              {submitting ? "Подождите..." : "Подтвердить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
