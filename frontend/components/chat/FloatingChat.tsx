"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import ChatWidget from "./ChatWidget";

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setUserId(getUserIdFromToken(token));
    }
  }, []);

  if (!userId) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={styles.fab}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "\u2715" : "\u2728"}
      </button>

      {/* Chat overlay */}
      {open && (
        <>
          <div style={styles.backdrop} onClick={() => setOpen(false)} />
          <div style={styles.overlay}>
            <ChatWidget userId={userId} />
          </div>
        </>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#0a0a0a",
    color: "#fafafa",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 1001,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 999,
  },
  overlay: {
    position: "fixed",
    bottom: 92,
    right: 24,
    width: 400,
    height: 520,
    zIndex: 1000,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
};
