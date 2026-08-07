import DealCard from "@/components/DealCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { dealsApi, type DealDto } from "@/lib/api";
import { mapDealStatusToUi, toUiDealView } from "@/lib/deal-status";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const filters = [
  { label: "Все", value: "all" },
  { label: "Активные", value: "safe" },
  { label: "Ожидание", value: "pending" },
  { label: "Споры", value: "danger" },
  { label: "Завершено", value: "done" },
];

const DealsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const nextDeals = await dealsApi.list(user?.userId ?? "");
        setDeals(nextDeals);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Не удалось загрузить сделки");
      }
      setLoading(false);
    };

    void fetchDeals();
  }, [user?.userId]);

  const filteredDeals = useMemo(
    () => {
      if (activeFilter === "all") return deals;
      return deals.filter((d) => mapDealStatusToUi(d.status).status === activeFilter);
    },
    [activeFilter, deals]
  );

  return (
    <div className="min-h-dvh bg-background pb-nav">
      <div className="bg-card px-5 pt-safe pb-4">
        <h1 className="text-xl font-bold text-card-foreground mb-4">Сделки</h1>
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                activeFilter === f.value
                  ? "gradient-brand text-brand-foreground shadow-brand"
                  : "bg-secondary text-muted-foreground hover:text-card-foreground"
              )}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1.5 opacity-70">
                  {deals.filter((d) => mapDealStatusToUi(d.status).status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Загрузка сделок...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Нет сделок</p>
          </div>
        ) : (
          filteredDeals.map((deal, i) => {
            const uiDeal = toUiDealView(deal, user?.userId ?? "");
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DealCard
                  title={uiDeal.title}
                  amount={uiDeal.amount}
                  counterparty={uiDeal.counterparty}
                  status={uiDeal.status}
                  statusLabel={uiDeal.statusLabel}
                  role={uiDeal.role}
                  onClick={() => uiDeal.status === "danger" ? navigate("/dispute") : navigate(`/deal/${deal.id}`)}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DealsPage;
