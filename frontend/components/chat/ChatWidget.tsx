"use client";

import { useState, useRef, useEffect } from "react";
import {
  sendChatMessage,
  getRecentConversation,
  ChatError,
  type ChatMessage,
} from "@/lib/chatkit";

interface ChatWidgetProps {
  userId: string;
}

export default function ChatWidget({ userId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load recent conversation on mount
  useEffect(() => {
    async function loadRecent() {
      try {
        const data = await getRecentConversation(userId);
        if (data && data.messages) {
          setConversationId(data.conversation_id);
          setMessages(data.messages);
        }
      } catch (err) {
        if (err instanceof ChatError && err.status === 401) {
          window.location.href = "/login";
          return;
        }
        // Silent fail on initial load — user can start fresh
      } finally {
        setInitialLoading(false);
      }
    }
    loadRecent();
  }, [userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userId, trimmed, conversationId);
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      if (err instanceof ChatError) {
        if (err.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (err.status === 503) {
          setError("Service temporarily unavailable. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to send message. Please try again.");
      }
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    setConversationId(null);
    setMessages([]);
    setError("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (initialLoading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>AI Task Assistant</h3>
        <button onClick={handleNewConversation} style={styles.newChatBtn}>
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messageArea}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>Start a conversation</p>
            <p style={styles.emptyHint}>
              Try &ldquo;Add a task to buy groceries&rdquo; or &ldquo;What are
              my tasks?&rdquo;
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={
              msg.role === "user" ? styles.userMessage : styles.assistantMessage
            }
          >
            <div style={styles.roleBadge}>
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div style={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={styles.assistantMessage}>
            <div style={styles.roleBadge}>Assistant</div>
            <div style={styles.messageContent}>
              <span style={styles.typing}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 400,
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    background: "#fafafa",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "#0a0a0a",
  },
  newChatBtn: {
    padding: "4px 12px",
    background: "transparent",
    color: "#737373",
    border: "1px solid #d4d4d4",
    borderRadius: 4,
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto" as const,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0a0a0a",
  },
  emptyHint: {
    fontSize: 13,
    color: "#737373",
  },
  userMessage: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    background: "#0a0a0a",
    color: "#fafafa",
    padding: "8px 12px",
    borderRadius: "12px 12px 2px 12px",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    background: "#f5f5f5",
    color: "#0a0a0a",
    padding: "8px 12px",
    borderRadius: "12px 12px 12px 2px",
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom: 4,
    opacity: 0.6,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
  },
  typing: {
    color: "#737373",
    fontStyle: "italic",
  },
  error: {
    padding: "8px 16px",
    background: "#fafafa",
    color: "#0a0a0a",
    fontSize: 13,
    borderTop: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
  },
  inputArea: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    borderTop: "1px solid #e0e0e0",
    background: "#fafafa",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #d4d4d4",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#0a0a0a",
    color: "#fafafa",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  loadingText: {
    color: "#737373",
    letterSpacing: "0.1em",
    fontSize: 13,
    textTransform: "uppercase" as const,
  },
};
