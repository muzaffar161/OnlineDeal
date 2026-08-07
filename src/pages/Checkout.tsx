import { ArrowLeft, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { dealsApi, paymentsApi, walletApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/**
 * Simulated checkout from wallet balance.
 * STRIPE_RESTORE: replace this page with Stripe Elements + paymentsApi.createIntent
 * (see git history / commented block in src/lib/api.ts).
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [title, setTitle] = useState("Сделка");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("usd");
  const [available, setAvailable] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isBuyer, setIsBuyer] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      if (!dealId) return;
      setLoading(true);
      setError(null);
      try {
        const [deal, wallet] = await Promise.all([
          dealsApi.getById(dealId, user?.userId ?? ""),
          walletApi.me(),
        ]);
        if (!deal) {
          toast.error("Сделка не найдена");
          navigate("/deals");
          return;
        }

        setTitle(deal.title);
        setAmount(deal.amount);
        setCurrency(deal.currency);
        setAvailable(wallet.availableBalance);
        setIsBuyer(deal.buyerId === user?.userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось открыть оплату";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void initCheckout();
  }, [dealId, navigate, user?.userId]);

  const amountLabel = useMemo(
    () => `${currency === "usd" ? "$" : ""}${Number(amount).toLocaleString()}`,
    [amount, currency],
  );

  const availableLabel = useMemo(
    () => `$${Number(available).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [available],
  );

  const payFromBalance = async () => {
    if (!dealId) return;
    setPaying(true);
    try {
      await paymentsApi.mockPay(dealId);
      toast.success("Оплата с баланса прошла. Средства заморожены в эскроу.");
      navigate(`/deal/${dealId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось оплатить");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-8">
      <div className="gradient-dark px-5 pt-safe pb-6 rounded-b-[1.5rem]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white transition-colors mb-4 touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Оплата сделки</h1>
        <p className="text-sm text-white/50 mt-0.5">{title}</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/70 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Сумма к оплате</p>
            <p className="text-xl font-bold text-card-foreground font-mono mt-1">{amountLabel}</p>
          </div>
          <Wallet className="w-6 h-6 text-brand" />
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/70">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Доступно на балансе</p>
          <p className="text-lg font-bold text-card-foreground font-mono mt-1">{availableLabel}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Имитация оплаты без Stripe. Средства спишутся с доступного баланса и заморозятся в эскроу.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Подготовка платежа...</p>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-status-danger">{error}</p>
            <button
              type="button"
              onClick={() => navigate(`/deal/${dealId}`)}
              className="w-full bg-card border border-border rounded-2xl py-3 font-semibold text-card-foreground"
            >
              Вернуться к договору
            </button>
          </div>
        ) : !isBuyer ? (
          <p className="text-sm text-muted-foreground">
            Оплатить может только покупатель. Дождитесь оплаты или откройте сделку.
          </p>
        ) : (
          <button
            type="button"
            disabled={paying || available < amount}
            onClick={() => void payFromBalance()}
            className="w-full gradient-brand text-brand-foreground font-bold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-brand disabled:opacity-60 touch-manipulation"
          >
            {paying
              ? "Оплата..."
              : available < amount
                ? "Недостаточно средств — пополните баланс"
                : "Оплатить с баланса"}
          </button>
        )}

        {isBuyer && available < amount && !loading && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-secondary text-card-foreground font-semibold py-3 rounded-2xl touch-manipulation"
          >
            Пополнить баланс на главной
          </button>
        )}
      </div>
    </div>
  );
};

export default Checkout;
