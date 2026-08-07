import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const quickUsers = [
  {
    label: "Войти как Buyer",
    username: "buyer_demo",
    contact: "buyer@demo.local",
    password: "BuyerDemo!123",
  },
  {
    label: "Войти как Seller",
    username: "seller_demo",
    contact: "seller@demo.local",
    password: "SellerDemo!123",
  },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!contact.trim() || !password.trim() || (isRegister && !username.trim())) {
      toast.error("Заполните обязательные поля");
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(username.trim(), contact.trim(), password);
      } else {
        await login(contact.trim(), password);
      }
      toast.success(isRegister ? "Аккаунт создан" : "Вход выполнен");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка авторизации");
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (preset: (typeof quickUsers)[number]) => {
    setSubmitting(true);
    try {
      try {
        await login(preset.contact, preset.password);
      } catch {
        await register(preset.username, preset.contact, preset.password);
      }
      toast.success(`Вход: ${preset.username}`);
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выполнить быстрый вход");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-card rounded-2xl p-5 shadow-card border border-border/70 space-y-3">
        <h1 className="text-xl font-bold text-card-foreground">{isRegister ? "Регистрация" : "Вход"}</h1>
        {isRegister && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-background rounded-xl px-3 py-2.5 border border-border outline-none focus:border-brand"
          />
        )}
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Телефон или email"
          className="w-full bg-background rounded-xl px-3 py-2.5 border border-border outline-none focus:border-brand"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full bg-background rounded-xl px-3 py-2.5 border border-border outline-none focus:border-brand"
        />
        <button
          disabled={submitting}
          onClick={submit}
          className="w-full gradient-brand text-brand-foreground font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {submitting ? "Подождите..." : isRegister ? "Создать аккаунт" : "Войти"}
        </button>
        <button className="w-full text-sm text-muted-foreground" onClick={() => setIsRegister((v) => !v)}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </button>
        <div className="pt-2 space-y-2">
          <p className="text-xs text-muted-foreground">Быстрый вход для теста полного цикла сделки</p>
          {quickUsers.map((preset) => (
            <button
              key={preset.contact}
              onClick={() => quickLogin(preset)}
              disabled={submitting}
              className="w-full bg-secondary text-card-foreground font-medium py-2.5 rounded-xl disabled:opacity-60"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
