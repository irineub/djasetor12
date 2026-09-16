// lib/api.ts – wrapper simples para a API JSON externa
export const API_BASE = process.env.API_BASE_URL ?? "";
export const API_TOKEN = process.env.API_TOKEN ?? "";

export const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
  };
  const resp = await fetch(`${API_BASE}${path}`, { headers, ...init });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`API error ${resp.status}: ${txt}`);
  }
  return resp.json();
};

/* Ajuste os tipos de retorno de acordo com sua API */

export const getRaffleNumbers = (raffleId: string) =>
  fetchJson<{ numbers: any[] }>(`/raffles/${raffleId}/numbers`);

export const reserveNumbers = (raffleId: string, payload: any) =>
  fetchJson<any>(`/raffles/${raffleId}/reserve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const confirmPayment = (raffleId: string, payload: any) =>
  fetchJson<any>(`/raffles/${raffleId}/pay`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminData = (raffleId: string) =>
  fetchJson<any>(`/admin/raffles/${raffleId}`);
