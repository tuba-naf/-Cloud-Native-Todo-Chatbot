import { api } from "./api";
import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface ChatResponseData {
  response: string;
  conversation_id: string;
}

export interface RecentConversationData {
  conversation_id: string;
  title: string | null;
  messages: ChatMessage[];
}

export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: string | null
): Promise<ChatResponseData> {
  const token = getToken();
  const body: Record<string, string> = { message };
  if (conversationId) {
    body.conversation_id = conversationId;
  }

  const res = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new ChatError(res.status, err.detail || "Request failed");
  }

  return res.json();
}

export async function getRecentConversation(
  userId: string
): Promise<RecentConversationData | null> {
  const token = getToken();

  const res = await fetch(`${API_URL}/api/${userId}/conversations/recent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 204 || res.status === 200) {
    const data = await res.json().catch(() => null);
    return data;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new ChatError(res.status, err.detail || "Request failed");
  }

  return null;
}

export class ChatError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ChatError";
  }
}
