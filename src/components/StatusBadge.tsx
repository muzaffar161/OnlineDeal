import { cn } from "@/lib/utils";

type StatusType = "safe" | "pending" | "danger" | "done";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  safe: "bg-status-safe-muted text-status-safe",
  pending: "bg-status-pending-muted text-status-pending",
  danger: "bg-status-danger-muted text-status-danger",
  done: "bg-status-done-muted text-status-done",
};

const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "safe" && "bg-status-safe",
        status === "pending" && "bg-status-pending",
        status === "danger" && "bg-status-danger",
        status === "done" && "bg-status-done",
      )} />
      {label}
    </span>
  );
};

export default StatusBadge;
