import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface DealCardProps {
  title: string;
  amount: string;
  counterparty: string;
  status: "safe" | "pending" | "danger" | "done";
  statusLabel: string;
  role: "Покупатель" | "Продавец";
  onClick?: () => void;
}

const statusAccent: Record<string, string> = {
  safe: "border-l-status-safe",
  pending: "border-l-status-pending",
  danger: "border-l-status-danger",
  done: "border-l-status-done",
};

const statusDot: Record<string, string> = {
  safe: "bg-status-safe",
  pending: "bg-status-pending",
  danger: "bg-status-danger",
  done: "bg-status-done",
};

const statusTextColor: Record<string, string> = {
  safe: "text-status-safe",
  pending: "text-status-pending",
  danger: "text-status-danger",
  done: "text-status-done",
};

const DealCard = ({ title, amount, counterparty, status, statusLabel, role, onClick }: DealCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card rounded-2xl p-4 border-l-4 shadow-card",
        "hover:shadow-card-hover transition-all duration-200 active:scale-[0.99]",
        "group",
        statusAccent[status]
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-card-foreground truncate">{title}</h3>
          <span className="text-sm text-muted-foreground">{counterparty}</span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-bold text-card-foreground font-mono">{amount}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
            {role}
          </span>
          <span className={cn("flex items-center gap-1.5 text-xs font-semibold", statusTextColor[status])}>
            <span className={cn("w-1.5 h-1.5 rounded-full", statusDot[status])} />
            {statusLabel}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

export default DealCard;
