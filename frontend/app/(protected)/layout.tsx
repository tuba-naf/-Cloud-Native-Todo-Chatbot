"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import FloatingChat from "@/components/chat/FloatingChat";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!checked) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#737373", letterSpacing: "0.1em", fontSize: 13, textTransform: "uppercase" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logoMark}></span>
          <h1 style={styles.logo}>TEAM TASK</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>
      <main style={styles.main}>{children}</main>
      <FloatingChat />
      <footer style={styles.footer}>
        <p style={styles.footerText}>Built with focus.</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "#0a0a0a",
    color: "#fafafa",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 8,
    height: 8,
    background: "#fafafa",
    borderRadius: "50%",
    display: "inline-block",
  },
  logo: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.2em",
    color: "#fafafa",
  },
  logoutBtn: {
    padding: "6px 16px",
    background: "transparent",
    color: "#a3a3a3",
    border: "1px solid #333",
    borderRadius: 4,
    fontSize: 12,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  main: {
    maxWidth: 640,
    width: "100%",
    margin: "0 auto",
    padding: "40px 24px",
    flex: 1,
  },
  footer: {
    padding: "24px 32px",
    textAlign: "center" as const,
    borderTop: "1px solid #e0e0e0",
  },
  footerText: {
    fontSize: 11,
    color: "#a3a3a3",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
};
