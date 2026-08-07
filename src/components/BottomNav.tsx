import { Home, FileText, PlusCircle, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: FileText, label: "Сделки", path: "/deals" },
  { icon: PlusCircle, label: "", path: "/create", isCenter: true },
  { icon: MessageCircle, label: "Чат", path: "/chat" },
  { icon: User, label: "Профиль", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenExact = ["/create", "/dispute", "/auth"];
  const isDealScreen = location.pathname.startsWith("/deal/");
  const isCheckoutScreen = location.pathname.startsWith("/checkout/");
  const isChatThread = /^\/chat\/.+/.test(location.pathname);

  if (
    hiddenExact.includes(location.pathname) ||
    isDealScreen ||
    isCheckoutScreen ||
    isChatThread
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 glass border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className="relative -mt-5 touch-manipulation"
                aria-label="Создать сделку"
              >
                <div className="w-14 h-14 rounded-2xl gradient-brand shadow-brand flex items-center justify-center transition-transform active:scale-95">
                  <PlusCircle className="w-7 h-7 text-brand-foreground" strokeWidth={2} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative touch-manipulation min-w-[3.25rem]",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                {tab.path === "/chat" && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-status-danger rounded-full" />
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{tab.label}</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
