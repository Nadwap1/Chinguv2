const RAW_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";
export const API_BASE = `${RAW_URL.replace(/\/$/, "")}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export type TranslateResult = {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  detected_source?: string;
};

export type ImageTranslateResult = {
  id: string;
  extracted_text: string;
  translated_text: string;
  target_lang: string;
};

export type TranscribeResult = { text: string; language?: string };

export type TTSResult = { audio_base64: string; mime: string };

export type ChatResult = { session_id: string; reply: string };

export type HistoryItem = {
  id: string;
  kind: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  created_at: string;
  favorite: boolean;
};

export const api = {
  translate: (body: { text: string; source_lang: string; target_lang: string }) =>
    request<TranslateResult>("/translate", { method: "POST", body: JSON.stringify(body) }),

  translateImage: (body: { image_base64: string; target_lang: string }) =>
    request<ImageTranslateResult>("/translate-image", { method: "POST", body: JSON.stringify(body) }),

  transcribe: (body: { audio_base64: string; mime_type: string; language?: string }) =>
    request<TranscribeResult>("/transcribe", { method: "POST", body: JSON.stringify(body) }),

  tts: (body: { text: string; target_lang?: string; voice?: string; speed?: number }) =>
    request<TTSResult>("/tts", { method: "POST", body: JSON.stringify(body) }),

  chat: (body: { session_id: string; message: string; practice_lang?: string }) =>
    request<ChatResult>("/chat", { method: "POST", body: JSON.stringify(body) }),

  chatHistory: (session_id: string) =>
    request<{ session_id: string; messages: { role: string; content: string; ts: string }[] }>(
      `/chat/${session_id}/history`,
    ),

  clearChat: (session_id: string) =>
    request<{ ok: boolean }>(`/chat/${session_id}`, { method: "DELETE" }),

  saveHistory: (body: {
    kind: string;
    source_text: string;
    translated_text: string;
    source_lang: string;
    target_lang: string;
  }) => request<HistoryItem>("/history", { method: "POST", body: JSON.stringify(body) }),

  listHistory: () => request<{ items: HistoryItem[] }>("/history"),

  deleteHistory: (id: string) =>
    request<{ ok: boolean }>(`/history/${id}`, { method: "DELETE" }),

  toggleFavorite: (id: string) =>
    request<{ id: string; favorite: boolean }>(`/history/${id}/favorite`, { method: "POST" }),

  // Admin
  adminLogin: (body: { username: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adminStats: (token: string) =>
    request<{ conversations: number; messages: number; translations: number }>(
      "/admin/stats",
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  adminConversations: (token: string) =>
    request<{ items: any[] }>("/admin/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminTranslations: (token: string) =>
    request<{ items: HistoryItem[] }>("/admin/translations", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminDeleteConversation: (token: string, session_id: string) =>
    request<{ deleted: number }>(`/admin/conversations/${session_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminDeleteTranslation: (token: string, id: string) =>
    request<{ deleted: number }>(`/admin/translations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminExportUrl: (token: string, kind: "translations" | "conversations", fmt: "json" | "csv") =>
    `${API_BASE}/admin/export?kind=${kind}&fmt=${fmt}`,

  // User auth
  ping: () => request<{ status: string; service?: string; ts?: string }>("/ping"),

  deleteAccount: (token: string | null) =>
    request<{ deleted: boolean; guest: boolean; user_id?: string }>("/auth/delete-account", {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  register: (body: { email: string; password: string; name?: string }) =>
    request<{ access_token: string; user: { id: string; email: string; name?: string } }>(
      "/auth/register", { method: "POST", body: JSON.stringify(body) },
    ),
  login: (body: { email: string; password: string }) =>
    request<{ access_token: string; user: { id: string; email: string; name?: string } }>(
      "/auth/login", { method: "POST", body: JSON.stringify(body) },
    ),
};
