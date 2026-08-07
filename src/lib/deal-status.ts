import type { DealDto } from "@/lib/api";

export type UiDealStatus = "safe" | "pending" | "danger" | "done";

export interface UiDealView {
  id: string;
  title: string;
  amount: string;
  counterparty: string;
  role: "Покупатель" | "Продавец";
  status: UiDealStatus;
  statusLabel: string;
}

export const mapDealStatusToUi = (status: number): { status: UiDealStatus; label: string; step: number } => {
  switch (status) {
    case 1:
      return { status: "pending", label: "Ожидание принятия", step: 0 };
    case 2:
      return { status: "pending", label: "Активна", step: 1 };
    case 3:
      return { status: "safe", label: "Escrow", step: 2 };
    case 4:
      return { status: "safe", label: "Ожидает подтверждения", step: 3 };
    case 5:
      return { status: "done", label: "Завершена", step: 4 };
    case 6:
      return { status: "done", label: "Отменена", step: 4 };
    case 7:
      return { status: "danger", label: "Спор", step: 3 };
    default:
      return { status: "pending", label: "Неизвестно", step: 0 };
  }
};

export const toUiDealView = (deal: DealDto, currentUserId: string): UiDealView => {
  const mapped = mapDealStatusToUi(deal.status);
  const currentUserIsBuyer = deal.buyerId === currentUserId;
  const counterparty = currentUserIsBuyer ? `@${deal.sellerId.slice(0, 8)}` : `@${deal.buyerId.slice(0, 8)}`;

  return {
    id: deal.id,
    title: deal.title,
    amount: `${deal.currency === "usd" ? "$" : ""}${Number(deal.amount).toLocaleString()}`,
    counterparty,
    role: currentUserIsBuyer ? "Покупатель" : "Продавец",
    status: mapped.status,
    statusLabel: mapped.label,
  };
};
