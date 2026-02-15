"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const justRegistered = searchParams.get("registered") === "true";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h1 style={styles.title}>Sign In</h1>

      {justRegistered && (
        <div style={styles.success}>
          Account created! Please sign in.
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.field}>
        <label htmlFor="email" style={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          placeholder="you@example.com"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="password" style={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          placeholder="Your password"
        />
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p style={styles.link}>
        Don&apos;t have an account? <a href="/register">Register</a>
      </p>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: 400,
    margin: "0 auto",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
  },
  success: {
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 14,
    border: "1px solid #bbf7d0",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 14,
    border: "1px solid #fecaca",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    fontSize: 16,
    outline: "none",
  },
  button: {
    padding: "12px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 500,
    marginTop: 8,
  },
  link: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
};
