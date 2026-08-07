import { Shield, FileText, Clock, Headphones, ChevronRight, Star, LogOut, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const menuItems = [
  { icon: Shield, label: "Безопасность", desc: "Пароль и 2FA", path: "/security" },
  { icon: FileText, label: "Документы", desc: "KYC верификация", path: "/documents" },
  { icon: Clock, label: "История транзакций", desc: "Все операции", path: "/history" },
  { icon: Headphones, label: "Поддержка", desc: "Помощь 24/7", path: "/support" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-background pb-nav">
      {/* Profile Header */}
      <div className="gradient-dark px-5 pt-safe pb-8 rounded-b-[2rem] flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-brand/30">
            <span className="text-4xl font-bold text-white">{(user?.username?.[0] ?? "U").toUpperCase()}</span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-brand flex items-center justify-center shadow-brand">
            <Camera className="w-3.5 h-3.5 text-brand-foreground" />
          </button>
        </div>
        <h1 className="text-xl font-bold text-white">@{user?.username ?? "user"}</h1>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="bg-status-safe/20 text-status-safe text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            ✓ Верифицирован
          </span>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 -mt-5"
      >
        <div className="bg-card rounded-2xl p-5 shadow-card flex items-center justify-around">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-5 h-5 text-status-pending fill-status-pending" />
              <span className="text-2xl font-bold text-card-foreground font-mono">4.9</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Рейтинг</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground font-mono">47</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Сделок</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-status-safe font-mono">98%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Успешных</p>
          </div>
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mt-5"
      >
        <div className="bg-card rounded-2xl overflow-hidden shadow-card">
          {menuItems.map((item, i) => (
            <button
              key={item.path}
              className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors hover:bg-secondary/50 active:bg-secondary ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-card-foreground block">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <div className="px-5 mt-4 space-y-2">
        <button
          onClick={() => {
            logout();
            toast.success("Сессия завершена. Выберите другой аккаунт.");
            navigate("/auth");
          }}
          className="w-full flex items-center justify-center gap-2 text-card-foreground font-semibold py-3.5 rounded-2xl bg-card border border-border transition-all active:scale-[0.98]"
        >
          Сменить аккаунт
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/auth");
          }}
          className="w-full flex items-center justify-center gap-2 text-status-danger font-semibold py-3.5 rounded-2xl bg-status-danger-muted transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Profile;
