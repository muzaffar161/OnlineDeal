const runtimeApiBaseUrl =
  typeof window !== "undefined" ? `http://${window.location.hostname}:5038` : "http://localhost:5038";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || runtimeApiBaseUrl;
const API_VERSION = "v1";

export const DEMO_BUYER_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_SELLER_ID = "22222222-2222-2222-2222-222222222222";
const TOKEN_STORAGE_KEY = "onlinedeal_mobile_access_token";
const USER_STORAGE_KEY = "onlinedeal_mobile_user";

export interface AuthResponse {
  accessToken: string;
  userId: string;
  username: string;
  contact: string;
}

let accessToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
let currentUser: Omit<AuthResponse, "accessToken"> | null = (() => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Omit<AuthResponse, "accessToken">;
  } catch {
    return null;
  }
})();

export interface CreateIntentPayload {
  amount: number;
  currency: string;
  dealId: string;
}

export interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface DealDto {
  id: string;
  buyerId: string;
  sellerId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: number;
}

export interface DealMessageDto {
  id: string;
  dealId: string;
  senderUserId: string;
  text: string;
  createdAtUtc: string;
}

export interface CreateDealPayload {
  title: string;
  description: string;
  amount: number;
  currency: string;
  role: "buyer" | "seller";
}

const readError = async (response: Response) => {
  const text = await response.text();
  return text || `Request failed (${response.status})`;
};

const readErrorWithAuthHandling = async (response: Response) => {
  const errorText = await readError(response);
  if (response.status === 401) {
    clearSession();
    return "Сессия истекла. Войдите заново.";
  }
  return errorText;
};

const headersWithActor = (_actorUserId: string) => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const setToken = (token: string) => {
  accessToken = token;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const setSession = (response: AuthResponse) => {
  setToken(response.accessToken);
  currentUser = {
    userId: response.userId,
    username: response.username,
    contact: response.contact,
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
};

export const clearSession = () => {
  accessToken = null;
  currentUser = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getCurrentUser = () => currentUser;

export const authApi = {
  async login(contact: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, password }),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    const payload = (await response.json()) as AuthResponse;
    setSession(payload);
    return payload;
  },

  async register(username: string, contact: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, contact, password }),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    const payload = (await response.json()) as AuthResponse;
    setSession(payload);
    return payload;
  },
};

export const ensureAuth = async (): Promise<void> => {
  if (!accessToken) {
    throw new Error("Необходим вход в аккаунт");
  }
};

export const dealsApi = {
  async create(payload: CreateDealPayload): Promise<DealDto> {
    await ensureAuth();
    if (!currentUser) throw new Error("Пользователь не найден. Войдите заново.");
    const body = {
      buyerId: payload.role === "buyer" ? currentUser.userId : DEMO_BUYER_ID,
      sellerId: payload.role === "buyer" ? DEMO_SELLER_ID : currentUser.userId,
      title: payload.title,
      description: payload.description,
      amount: payload.amount,
      currency: payload.currency.toLowerCase(),
    };

    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }

    return response.json() as Promise<DealDto>;
  },

  async getById(dealId: string, actorUserId: string): Promise<DealDto | null> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}`, {
      headers: headersWithActor(actorUserId),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    return response.json() as Promise<DealDto>;
  },

  async list(actorUserId: string): Promise<DealDto[]> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals`, {
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    return response.json() as Promise<DealDto[]>;
  },

  async accept(dealId: string, actorUserId: string): Promise<void> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/accept`, {
      method: "POST",
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
  },

  async markDone(dealId: string, actorUserId: string): Promise<void> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/mark-done`, {
      method: "POST",
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
  },

  async confirm(dealId: string, actorUserId: string, fee = 0): Promise<void> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/confirm?fee=${fee}`, {
      method: "POST",
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
  },

  async dispute(dealId: string, actorUserId: string): Promise<void> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/dispute`, {
      method: "POST",
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
  },

  async listMessages(dealId: string, actorUserId: string): Promise<DealMessageDto[]> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/messages`, {
      headers: headersWithActor(actorUserId),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    return response.json() as Promise<DealMessageDto[]>;
  },

  async sendMessage(dealId: string, senderUserId: string, text: string): Promise<DealMessageDto> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/deals/${dealId}/messages`, {
      method: "POST",
      headers: headersWithActor(senderUserId),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }
    return response.json() as Promise<DealMessageDto>;
  },
};

export const paymentsApi = {
  async createIntent(payload: CreateIntentPayload): Promise<CreateIntentResponse> {
    await ensureAuth();
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/payments/create-intent`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readErrorWithAuthHandling(response));
    }

    return response.json() as Promise<CreateIntentResponse>;
  },
};
