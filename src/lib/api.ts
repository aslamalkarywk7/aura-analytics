const TOKEN_KEY = 'aura_analytics_token';
let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(t: string | null): void {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return token;
}

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, options: {method?: string; body?: unknown} = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (data as {error?: {code?: string; message?: string}}).error;
    throw new ApiError(err?.code ?? 'ERROR', err?.message ?? res.statusText, res.status);
  }
  return data as T;
}
