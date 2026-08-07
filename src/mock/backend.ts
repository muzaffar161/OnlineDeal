export type DealStatus = "safe" | "pending" | "danger" | "done";
export type DealRole = "Покупатель" | "Продавец";

export interface DealMessage {
  id: string;
  type: "system" | "user" | "self";
  text: string;
  sender?: string;
  time: string;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  currency: "USD" | "EUR" | "RUB" | "USDT";
  counterparty: string;
  status: DealStatus;
  statusLabel: string;
  role: DealRole;
  description: string;
  deadlineDays: number;
  createdAt: string;
  messages: DealMessage[];
}

export interface CreateDealInput {
  title: string;
  amount: number;
  currency: "USD" | "EUR" | "RUB" | "USDT";
  counterparty: string;
  description: string;
  deadlineDays: number;
  role: "buyer" | "seller";
}

const STORAGE_KEY = "mock_backend_deals_v1";
const LATENCY_MS = 350;

const seedDeals: Deal[] = [
  {
    id: "1",
    title: "Разработка сайта",
    amount: 800,
    currency: "USD",
    counterparty: "@designer_pro",
    status: "safe",
    statusLabel: "В процессе",
    role: "Покупатель",
    description: "Лендинг на React, 5 секций, адаптивный дизайн",
    deadlineDays: 3,
    createdAt: new Date().toISOString(),
    messages: [
      { id: "m1", type: "system", text: "Сделка создана. Средства заморожены.", time: "14:00" },
      { id: "m2", type: "user", text: "Начинаю работу, ориентировочно 3 дня.", sender: "@designer_pro", time: "14:05" },
      { id: "m3", type: "self", text: "Хорошо, жду результат.", time: "14:06" },
    ],
  },
  {
    id: "2",
    title: "Логотип и брендинг",
    amount: 350,
    currency: "USD",
    counterparty: "@brand_master",
    status: "pending",
    statusLabel: "Ожидание",
    role: "Покупатель",
    description: "Логотип, цветовая палитра и мини-гайд по стилю",
    deadlineDays: 7,
    createdAt: new Date().toISOString(),
    messages: [{ id: "m4", type: "system", text: "Сделка создана и ожидает подтверждения второй стороны.", time: "Сегодня" }],
  },
  {
    id: "3",
    title: "SEO-аудит",
    amount: 200,
    currency: "USD",
    counterparty: "@seo_guru",
    status: "done",
    statusLabel: "Завершено",
    role: "Продавец",
    description: "Аудит структуры и базовые рекомендации",
    deadlineDays: 1,
    createdAt: new Date().toISOString(),
    messages: [{ id: "m5", type: "system", text: "Сделка завершена. Выплата произведена.", time: "Вчера" }],
  },
  {
    id: "4",
    title: "Мобильное приложение",
    amount: 1200,
    currency: "USD",
    counterparty: "@app_dev",
    status: "danger",
    statusLabel: "Спор",
    role: "Покупатель",
    description: "Прототип мобильного приложения с базовым функционалом",
    deadlineDays: 14,
    createdAt: new Date().toISOString(),
    messages: [{ id: "m6", type: "system", text: "Открыт спор по сделке.", time: "Сегодня" }],
  },
];

const delay = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const loadDeals = (): Deal[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDeals));
    return seedDeals;
  }

  try {
    return JSON.parse(raw) as Deal[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDeals));
    return seedDeals;
  }
};

const saveDeals = (deals: Deal[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
};

export const mockBackend = {
  async listDeals() {
    await delay();
    return loadDeals().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async getDealById(id: string) {
    await delay();
    return loadDeals().find((deal) => deal.id === id) ?? null;
  },

  async createDeal(input: CreateDealInput) {
    await delay();
    const deals = loadDeals();
    const newDeal: Deal = {
      id: crypto.randomUUID(),
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      counterparty: input.counterparty,
      status: "pending",
      statusLabel: "Ожидание",
      role: input.role === "buyer" ? "Покупатель" : "Продавец",
      description: input.description,
      deadlineDays: input.deadlineDays,
      createdAt: new Date().toISOString(),
      messages: [{ id: crypto.randomUUID(), type: "system", text: "Сделка создана и ожидает подтверждения второй стороны.", time: "Сейчас" }],
    };

    saveDeals([newDeal, ...deals]);
    return newDeal;
  },

  async sendMessage(dealId: string, text: string, sender: "self" | "user" = "self") {
    await delay(200);
    const deals = loadDeals();
    const deal = deals.find((item) => item.id === dealId);
    if (!deal) return null;

    const message: DealMessage = {
      id: crypto.randomUUID(),
      type: sender,
      text,
      sender: sender === "user" ? deal.counterparty : undefined,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    deal.messages.push(message);
    saveDeals(deals);
    return message;
  },
};
