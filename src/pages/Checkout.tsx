import { ArrowLeft, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { dealsApi, paymentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "").replace(/^=+/, "").trim();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CheckoutForm = ({ dealId }: { dealId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/deal/${dealId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message ?? "Ошибка оплаты");
      setSubmitting(false);
      return;
    }

    toast.success("Оплата прошла успешно");
    navigate(`/deal/${dealId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/70">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full gradient-brand text-brand-foreground font-bold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-brand disabled:opacity-60"
      >
        {submitting ? "Подтверждение..." : "Оплатить"}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [title, setTitle] = useState("Сделка");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("usd");

  useEffect(() => {
    const initCheckout = async () => {
      if (!dealId) return;
      setLoading(true);
      setPaymentError(null);
      try {
        const deal = await dealsApi.getById(dealId, user?.userId ?? "");
        if (!deal) {
          toast.error("Сделка не найдена");
          navigate("/deals");
          return;
        }

        setTitle(deal.title);
        setAmount(deal.amount);
        setCurrency(deal.currency);

        const intent = await paymentsApi.createIntent({
          amount: Math.round(deal.amount * 100),
          currency: deal.currency,
          dealId: deal.id,
        });
        setClientSecret(intent.clientSecret);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Не удалось инициализировать оплату";
        setPaymentError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void initCheckout();
  }, [dealId, navigate, user?.userId]);

  const amountLabel = useMemo(
    () => `${currency === "usd" ? "$" : ""}${amount.toLocaleString()}`,
    [amount, currency]
  );

  return (
    <div className="min-h-dvh bg-background pb-8">
      <div className="gradient-dark px-5 pt-safe pb-6 rounded-b-[1.5rem]">
        <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors mb-4">
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
          <CreditCard className="w-6 h-6 text-brand" />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Подготовка платежа...</p>
        ) : !stripePromise ? (
          <p className="text-sm text-status-danger">Не задан VITE_STRIPE_PUBLISHABLE_KEY.</p>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm dealId={dealId ?? ""} />
          </Elements>
        ) : paymentError ? (
          <div className="space-y-3">
            <p className="text-sm text-status-danger">{paymentError}</p>
            <button
              onClick={() => navigate(`/deal/${dealId}`)}
              className="w-full bg-card border border-border rounded-2xl py-3 font-semibold text-card-foreground"
            >
              Вернуться к договору
            </button>
          </div>
        ) : (
          <p className="text-sm text-status-danger">Не удалось создать платеж.</p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
