import { MessageCircle, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dealsApi, type DealDto, type DealMessageDto } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface ChatListItem {
  deal: DealDto;
  lastMessage: DealMessageDto | null;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const userId = user?.userId ?? "";
        const nextDeals = await dealsApi.list(userId);
        const nextThreads = await Promise.all(
          nextDeals.map(async (deal) => {
            const messages = await dealsApi.listMessages(deal.id, userId);
            return { deal, lastMessage: messages[messages.length - 1] ?? null };
          }),
        );
        setThreads(nextThreads.filter((item) => item.lastMessage));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Не удалось загрузить чаты");
      }
      setLoading(false);
    };

    void fetchDeals();
  }, [user?.userId]);

  return (
    <div className="min-h-dvh bg-background pb-nav">
      <div className="bg-card px-5 pt-safe pb-4">
        <h1 className="text-xl font-bold text-card-foreground">Чат</h1>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Загрузка чатов...</p>
          </div>
        )}

        {!loading && threads.map((thread) => (
          <button
            key={thread.deal.id}
            onClick={() => navigate(`/chat/${thread.deal.id}`)}
            className="w-full text-left bg-card rounded-2xl p-4 shadow-card border border-border/70 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold text-card-foreground">
                {thread.deal.buyerId === user?.userId ? `@${thread.deal.sellerId.slice(0, 8)}` : `@${thread.deal.buyerId.slice(0, 8)}`}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {thread.lastMessage?.text ?? "Нет сообщений"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-xs text-muted-foreground">
                {thread.lastMessage ? new Date(thread.lastMessage.createdAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}

        {!loading && threads.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Пока нет сообщений</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
