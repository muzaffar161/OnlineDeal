import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dealsApi, type DealDto, type DealMessageDto } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const ChatThread = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dealId } = useParams();
  const [deal, setDeal] = useState<DealDto | null>(null);
  const [messages, setMessages] = useState<DealMessageDto[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!dealId) return;
      setLoading(true);
      try {
        const userId = user?.userId ?? "";
        const [currentDeal, dealMessages] = await Promise.all([
          dealsApi.getById(dealId, userId),
          dealsApi.listMessages(dealId, userId),
        ]);
        setDeal(currentDeal);
        setMessages(dealMessages);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Не удалось загрузить чат");
      }
      setLoading(false);
    };

    void fetchDeal();
  }, [dealId, user?.userId]);

  const sendMessage = async () => {
    if (!deal || !message.trim()) return;
    try {
      const sent = await dealsApi.sendMessage(deal.id, user?.userId ?? "", message.trim());
      setMessages((prev) => [...prev, sent]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось отправить сообщение");
    }
    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Загрузка чата...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-5 text-center">
        <div>
          <p className="text-card-foreground font-semibold mb-2">Чат не найден</p>
          <button onClick={() => navigate("/chat")} className="text-brand text-sm font-semibold">
            Вернуться к списку чатов
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <div className="gradient-dark px-5 pt-safe pb-5 rounded-b-[1.5rem] shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="text-white/70 hover:text-white transition-colors touch-manipulation p-1"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/deal/${deal.id}`)}
            className="text-white text-sm font-semibold touch-manipulation"
          >
            К сделке
          </button>
        </div>
        <h1 className="text-xl font-bold text-white mt-3 truncate">
          {deal.buyerId === user?.userId ? `@${deal.sellerId.slice(0, 8)}` : `@${deal.buyerId.slice(0, 8)}`}
        </h1>
        <p className="text-sm text-white/50 truncate">{deal.title}</p>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.senderUserId === user?.userId
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                msg.senderUserId === user?.userId
                  ? "gradient-brand text-brand-foreground rounded-br-md"
                  : "bg-card text-card-foreground shadow-card rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
              <p className={`text-[9px] mt-1 text-right ${msg.senderUserId === user?.userId ? "text-white/50" : "text-muted-foreground"}`}>
                {new Date(msg.createdAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 px-5 pt-2 bg-background/95 glass border-t border-border/40 pb-safe-input shrink-0">
        <div className="flex items-center gap-2 bg-card rounded-2xl p-2 shadow-card border border-border/50">
          <button
            type="button"
            className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary touch-manipulation"
            aria-label="Прикрепить файл"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Сообщение..."
            className="flex-1 bg-transparent text-base outline-none text-card-foreground placeholder:text-muted-foreground min-w-0"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            className={`p-2.5 rounded-xl transition-all touch-manipulation ${message.trim() ? "gradient-brand text-brand-foreground shadow-brand" : "text-muted-foreground"}`}
            aria-label="Отправить"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
