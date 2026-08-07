import { ArrowLeft, Check, Copy, Link2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { dealsApi } from "@/lib/api";

const stepTitles = ["Детали", "Участник", "Условия", "Итог"];

const CreateDeal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    role: "buyer",
    counterparty: "",
    description: "",
    deadline: "3",
    autoRelease: false,
  });
  const [creating, setCreating] = useState(false);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm({ ...form, [field]: value });
  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => (step === 0 ? navigate(-1) : setStep((s) => s - 1));

  const slideVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  const createDeal = async () => {
    if (!form.title || !form.amount) {
      toast.error("Заполните название и сумму");
      return;
    }

    setCreating(true);
    try {
      const newDeal = await dealsApi.create({
        title: form.title,
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description || "Без описания",
        role: form.role as "buyer" | "seller",
      });
      toast.success("Сделка создана, переходим к оплате");
      navigate(`/checkout/${newDeal.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось создать сделку");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-4 flex flex-col">
      {/* Header */}
      <div className="gradient-dark px-5 pt-safe pb-6 rounded-b-[1.5rem]">
        <button onClick={prev} className="mb-4 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Создать сделку</h1>
        <p className="text-sm text-white/50 mt-0.5">Шаг {step + 1} из {stepTitles.length}</p>
      </div>

      {/* Step Indicator */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          {stepTitles.map((title, i) => (
            <div key={title} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                i < step ? "gradient-brand" : i === step ? "bg-brand animate-pulse-soft" : "bg-border"
              }`} />
              <span className={`text-[10px] font-medium mt-1.5 block text-center transition-colors ${
                i <= step ? "text-brand font-semibold" : "text-muted-foreground"
              }`}>{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Content */}
      <div className="px-5 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Название</label>
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Например: Разработка сайта"
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-sm text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all shadow-card"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Сумма</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
                    <input
                      value={form.amount}
                      onChange={(e) => update("amount", e.target.value)}
                      placeholder="0.00"
                      type="number"
                      className="w-full bg-card rounded-2xl pl-9 pr-4 py-3.5 text-sm text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all font-mono shadow-card"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Валюта</label>
                  <div className="flex gap-2">
                    {["USD", "EUR", "RUB", "USDT"].map((c) => (
                      <button
                        key={c}
                        onClick={() => update("currency", c)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
                          form.currency === c
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card hover:border-brand/30"
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Ваша роль</label>
                  <div className="flex gap-2">
                    {[{ v: "buyer", l: "Покупатель", emoji: "🛒" }, { v: "seller", l: "Продавец", emoji: "💼" }].map((r) => (
                      <button
                        key={r.v}
                        onClick={() => update("role", r.v)}
                        className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          form.role === r.v
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card hover:border-brand/30"
                        }`}
                      >
                        <span>{r.emoji}</span>
                        {r.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email или Username</label>
                  <input
                    value={form.counterparty}
                    onChange={(e) => update("counterparty", e.target.value)}
                    placeholder="@username или email"
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-sm text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all shadow-card"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 gradient-brand rounded-2xl opacity-5" />
                  <div className="bg-card rounded-2xl p-5 border border-brand/10 shadow-card relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-4 h-4 text-brand" />
                      <p className="text-sm font-semibold text-card-foreground">Ссылка-приглашение</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface-sunken rounded-xl px-3 py-3 text-xs text-muted-foreground truncate font-mono">
                        https://escrow.app/invite/abc123
                      </div>
                      <button
                        onClick={() => toast.success("Ссылка скопирована")}
                        className="gradient-brand text-brand-foreground p-3 rounded-xl shadow-brand transition-all active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Условия</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Опишите что должен сделать продавец..."
                    rows={4}
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-sm text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all resize-none shadow-card"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Срок (дней)</label>
                  <div className="flex gap-2">
                    {["1", "3", "7", "14"].map((d) => (
                      <button
                        key={d}
                        onClick={() => update("deadline", d)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
                          form.deadline === d
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card"
                        }`}
                      >{d} {Number(d) === 1 ? "день" : Number(d) < 5 ? "дня" : "дней"}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-4 shadow-card border border-border">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Авто-релиз</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Автоматически после срока</p>
                  </div>
                  <button
                    onClick={() => update("autoRelease", !form.autoRelease)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center ${
                      form.autoRelease ? "gradient-brand shadow-brand" : "bg-border"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-6 h-6 bg-white rounded-full shadow-md mx-1"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
                  <h3 className="font-bold text-card-foreground text-lg">Итог сделки</h3>
                  {[
                    { label: "Название", value: form.title || "—" },
                    { label: "Сумма", value: form.amount ? `$${form.amount}` : "—", mono: true },
                    { label: "Комиссия (2%)", value: form.amount ? `$${(Number(form.amount) * 0.02).toFixed(2)}` : "—", mono: true },
                    { label: "Участник", value: form.counterparty || "—" },
                    { label: "Роль", value: form.role === "buyer" ? "Покупатель" : "Продавец" },
                    { label: "Срок", value: `${form.deadline} дн.` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold text-card-foreground ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Итого</span>
                    <span className="font-extrabold text-xl text-brand font-mono">
                      {form.amount ? `$${(Number(form.amount) * 1.02).toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
                <div className="bg-status-safe-muted rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-lg">🔒</span>
                  <p className="text-sm text-status-safe leading-relaxed">
                    Деньги будут заморожены на эскроу-счёте до подтверждения выполнения обеими сторонами.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="px-5 mt-6 pb-safe-input">
        <button
          type="button"
          onClick={step === 3 ? createDeal : next}
          disabled={creating}
          className="w-full gradient-brand text-brand-foreground font-bold py-4 rounded-2xl text-base transition-all active:scale-[0.97] shadow-brand touch-manipulation"
        >
          {step === 3 ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> {creating ? "Создание..." : "Создать сделку"}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              Далее <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateDeal;
