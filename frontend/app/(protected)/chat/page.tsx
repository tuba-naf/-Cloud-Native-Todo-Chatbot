"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import ChatWidget from "@/components/chat/ChatWidget";

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const id = getUserIdFromToken(token);
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  if (!userId) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p
          style={{
            color: "#737373",
            letterSpacing: "0.1em",
            fontSize: 13,
            textTransform: "uppercase",
          }}
        >
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.hero}>
        <h2 style={styles.heading}>AI Chat</h2>
        <p style={styles.subtitle}>
          Manage your tasks with natural language
        </p>
        <div style={styles.divider}></div>
      </div>
      <ChatWidget userId={userId} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#0a0a0a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    lineHeight: 1.7,
  },
  divider: {
    width: 40,
    height: 2,
    background: "#0a0a0a",
    marginTop: 16,
  },
};
