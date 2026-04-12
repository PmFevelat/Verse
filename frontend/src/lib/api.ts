import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth?.currentUser;
  if (!user) return { "Content-Type": "application/json" };

  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Erreur API");
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
