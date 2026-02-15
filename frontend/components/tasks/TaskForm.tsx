"use client";

import { useState, FormEvent } from "react";

interface TaskFormProps {
  onSubmit: (title: string) => Promise<void>;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Task title is required");
      return;
    }
    if (trimmed.length > 500) {
      setError("Title must be 500 characters or less");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setTitle("");
    } catch {
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputRow}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={styles.input}
          maxLength={500}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "..." : "Add"}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    marginBottom: 24,
  },
  inputRow: {
    display: "flex",
    gap: 0,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRight: "none",
    fontSize: 15,
    background: "#fff",
    color: "#0a0a0a",
  },
  button: {
    padding: "12px 24px",
    background: "#0a0a0a",
    color: "#fafafa",
    border: "1px solid #0a0a0a",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap",
  },
  error: {
    color: "#0a0a0a",
    fontSize: 13,
    marginTop: 8,
    fontStyle: "italic",
  },
};
