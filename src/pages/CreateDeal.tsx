import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { dealsApi, usersApi, type UserSearchResultDto } from "@/lib/api";

const stepTitles = ["Детали", "Участник", "Условия", "Итог"];

const CreateDeal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    role: "buyer",
    description: "",
    deadline: "3",
    autoRelease: false,
  });
  const [counterpartyQuery, setCounterpartyQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResultDto[]>([]);
  const [selectedCounterparty, setSelectedCounterparty] = useState<UserSearchResultDto | null>(null);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm({ ...form, [field]: value });

  const next = () => {
    if (step === 1 && !selectedCounterparty) {
      toast.error("Выберите участника из списка");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };
  const prev = () => (step === 0 ? navigate(-1) : setStep((s) => s - 1));

  useEffect(() => {
    if (step !== 1) return;
    if (selectedCounterparty) {
      setSearchResults([]);
      return;
    }

    const q = counterpartyQuery.trim();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      setSearching(true);
      void usersApi
        .search(q)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [counterpartyQuery, selectedCounterparty, step]);

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
    if (!selectedCounterparty) {
      toast.error("Выберите участника сделки");
      setStep(1);
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
        counterpartyUserId: selectedCounterparty.userId,
      });
      toast.success(
        form.role === "buyer"
          ? "Сделка создана, переходим к оплате с баланса"
          : "Сделка создана. Покупатель сможет оплатить с баланса.",
      );
      if (form.role === "buyer") {
        navigate(`/checkout/${newDeal.id}`);
      } else {
        navigate(`/deal/${newDeal.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось создать сделку");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-4 flex flex-col">
      <div className="gradient-dark px-5 pt-safe pb-6 rounded-b-[1.5rem]">
        <button type="button" onClick={prev} className="mb-4 text-white/70 hover:text-white transition-colors touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Создать сделку</h1>
        <p className="text-sm text-white/50 mt-0.5">
          Шаг {step + 1} из {stepTitles.length}
        </p>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          {stepTitles.map((title, i) => (
            <div key={title} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < step ? "gradient-brand" : i === step ? "bg-brand animate-pulse-soft" : "bg-border"
                }`}
              />
              <span
                className={`text-[10px] font-medium mt-1.5 block text-center transition-colors ${
                  i <= step ? "text-brand font-semibold" : "text-muted-foreground"
                }`}
              >
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

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
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all shadow-card"
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
                      className="w-full bg-card rounded-2xl pl-9 pr-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all font-mono shadow-card"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Валюта</label>
                  <div className="flex gap-2">
                    {["USD", "EUR", "RUB", "USDT"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update("currency", c)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all touch-manipulation ${
                          form.currency === c
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card hover:border-brand/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Ваша роль</label>
                  <div className="flex gap-2">
                    {[
                      { v: "buyer", l: "Покупатель" },
                      { v: "seller", l: "Продавец" },
                    ].map((r) => (
                      <button
                        key={r.v}
                        type="button"
                        onClick={() => update("role", r.v)}
                        className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all touch-manipulation ${
                          form.role === r.v
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card hover:border-brand/30"
                        }`}
                      >
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
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Username или контакт
                  </label>
                  <input
                    value={selectedCounterparty ? `@${selectedCounterparty.username}` : counterpartyQuery}
                    onChange={(e) => {
                      setSelectedCounterparty(null);
                      setCounterpartyQuery(e.target.value);
                    }}
                    placeholder="Начните вводить имя, например jan"
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all shadow-card"
                    autoComplete="off"
                  />
                  {searching && <p className="text-xs text-muted-foreground mt-2">Поиск...</p>}
                  {!selectedCounterparty && searchResults.length > 0 && (
                    <div className="mt-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                      {searchResults.map((u) => (
                        <button
                          key={u.userId}
                          type="button"
                          onClick={() => {
                            setSelectedCounterparty(u);
                            setCounterpartyQuery(u.username);
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/50 active:bg-secondary touch-manipulation"
                        >
                          <p className="text-sm font-semibold text-card-foreground">@{u.username}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{u.contact}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!selectedCounterparty && !searching && counterpartyQuery.trim().length > 0 && searchResults.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Никого не найдено. Попробуйте другое имя.</p>
                  )}
                  {selectedCounterparty && (
                    <div className="mt-3 bg-status-safe-muted rounded-2xl px-4 py-3">
                      <p className="text-sm font-semibold text-status-safe">Выбран: @{selectedCounterparty.username}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedCounterparty.contact}</p>
                    </div>
                  )}
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
                    className="w-full bg-card rounded-2xl px-4 py-3.5 text-base text-card-foreground outline-none border border-border focus:border-brand focus:shadow-brand transition-all resize-none shadow-card"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Срок (дней)</label>
                  <div className="flex gap-2">
                    {["1", "3", "7", "14"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("deadline", d)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all touch-manipulation ${
                          form.deadline === d
                            ? "gradient-brand text-brand-foreground shadow-brand"
                            : "bg-card text-card-foreground border border-border shadow-card"
                        }`}
                      >
                        {d} {Number(d) === 1 ? "день" : Number(d) < 5 ? "дня" : "дней"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-4 shadow-card border border-border">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Авто-релиз</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Автоматически после срока</p>
                  </div>
                  <button
                    type="button"
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
                    { label: "Участник", value: selectedCounterparty ? `@${selectedCounterparty.username}` : "—" },
                    { label: "Роль", value: form.role === "buyer" ? "Покупатель" : "Продавец" },
                    { label: "Срок", value: `${form.deadline} дн.` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm gap-3">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold text-card-foreground text-right ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
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
                <div className="bg-status-safe-muted rounded-2xl p-4">
                  <p className="text-sm text-status-safe leading-relaxed">
                    Оплата идёт с баланса (имитация, без Stripe). Деньги замораживаются в эскроу до подтверждения.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 mt-6 pb-safe-input">
        <button
          type="button"
          onClick={step === 3 ? () => void createDeal() : next}
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
