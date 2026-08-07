import { ArrowLeft, Check, CreditCard, Home, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { walletApi } from "@/lib/api";

type FlowMode = "top-up" | "withdraw";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const detectBrand = (cardNumber: string) => {
  const digits = onlyDigits(cardNumber);
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (digits.startsWith("8600") || digits.startsWith("9860")) return "Uzcard";
  if (digits.length === 0) return "Card";
  return "Card";
};

const formatMoney = (value: number) =>
  `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Full-screen simulated card top-up / withdraw.
 * STRIPE_RESTORE: swap submit handler for real card tokenization later.
 */
const WalletCardFlow = () => {
  const navigate = useNavigate();
  const { mode: modeParam } = useParams();
  const mode: FlowMode = modeParam === "withdraw" ? "withdraw" : "top-up";

  const [step, setStep] = useState<"form" | "success">("form");
  const [amountInput, setAmountInput] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultAmount, setResultAmount] = useState(0);
  const [newAvailable, setNewAvailable] = useState(0);

  const title = mode === "top-up" ? "Пополнение с карты" : "Вывод на карту";
  const submitLabel = mode === "top-up" ? "Оплатить картой" : "Вывести на карту";
  const cardBrand = detectBrand(cardNumber);
  const last4 = onlyDigits(cardNumber).slice(-4);
  const maskedPreview = useMemo(() => {
    const digits = onlyDigits(cardNumber).padEnd(16, "•");
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }, [cardNumber]);

  const validate = () => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Введите сумму больше 0");
      return null;
    }
    const digits = onlyDigits(cardNumber);
    if (digits.length < 16) {
      toast.error("Введите полный номер карты");
      return null;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Срок: MM/YY");
      return null;
    }
    const [mm] = cardExpiry.split("/").map(Number);
    if (mm < 1 || mm > 12) {
      toast.error("Некорректный месяц");
      return null;
    }
    if (onlyDigits(cardCvv).length < 3) {
      toast.error("Введите CVV");
      return null;
    }
    if (!cardHolder.trim()) {
      toast.error("Введите имя на карте");
      return null;
    }
    return amount;
  };

  const submit = async () => {
    const amount = validate();
    if (amount == null) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const next =
        mode === "top-up" ? await walletApi.topUp(amount) : await walletApi.withdraw(amount);
      setResultAmount(amount);
      setNewAvailable(next.availableBalance);
      setStep("success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Операция не выполнена");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-dvh"
          >
            <div className="gradient-dark px-5 pt-safe pb-6 rounded-b-[1.5rem]">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-white/70 hover:text-white transition-colors mb-4 touch-manipulation p-1"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-sm text-white/50 mt-0.5">Имитация оплаты банковской картой</p>
            </div>

            <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto pb-safe-input">
              <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-brand gradient-dark">
                <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full bg-brand/20" />
                <div className="relative flex items-start justify-between mb-8">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 opacity-90" />
                  <span className="text-sm font-semibold tracking-wide text-white/90">{cardBrand}</span>
                </div>
                <p className="relative font-mono text-lg tracking-[0.18em] mb-5">{maskedPreview}</p>
                <div className="relative flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/50">Владелец</p>
                    <p className="text-sm font-semibold truncate uppercase">{cardHolder.trim() || "NAME SURNAME"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/50">Срок</p>
                    <p className="text-sm font-semibold font-mono">{cardExpiry || "MM/YY"}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Номер карты
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="ACCT-000003"
                    className="w-full bg-card rounded-2xl pl-11 pr-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand font-mono tracking-wider shadow-card"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Имя на карте
                </label>
                <input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  autoComplete="cc-name"
                  placeholder="IVAN IVANOV"
                  className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand uppercase shadow-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Срок
                  </label>
                  <input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand font-mono shadow-card"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    CVV
                  </label>
                  <input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(onlyDigits(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    type="password"
                    placeholder="•••"
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand font-mono shadow-card"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Сумма
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
                  <input
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-card rounded-2xl pl-9 pr-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand font-mono shadow-card"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 rounded-xl px-3 py-2.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Данные карты никуда не отправляются — только имитация.</span>
              </div>
            </div>

            <div className="px-5 pb-safe-input pt-2 border-t border-border/50 bg-background">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="w-full gradient-brand text-brand-foreground font-bold py-4 rounded-2xl disabled:opacity-60 touch-manipulation shadow-brand"
              >
                {submitting ? "Обработка карты..." : submitLabel}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col min-h-dvh"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-safe">
              <div className="w-20 h-20 rounded-full gradient-brand shadow-brand flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-brand-foreground" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                {mode === "top-up" ? "Баланс пополнен" : "Вывод выполнен"}
              </h1>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Карта ••{last4 || "••••"} · {formatMoney(resultAmount)}
              </p>
              <div className="w-full max-w-sm bg-card rounded-2xl p-5 shadow-card border border-border/70 space-y-3 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Операция</span>
                  <span className="font-semibold text-card-foreground">
                    {mode === "top-up" ? "Пополнение" : "Вывод"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сумма</span>
                  <span className="font-semibold font-mono text-card-foreground">{formatMoney(resultAmount)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доступно сейчас</span>
                  <span className="font-bold font-mono text-brand">{formatMoney(newAvailable)}</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-safe-input pt-4">
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="w-full gradient-brand text-brand-foreground font-bold py-4 rounded-2xl touch-manipulation shadow-brand flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Домой
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletCardFlow;
