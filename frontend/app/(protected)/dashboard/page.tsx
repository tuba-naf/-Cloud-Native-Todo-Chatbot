"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { Task, TaskListResponse } from "@/types";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";

const QUOTES = [
  "Alone we can do so little; together we can do so much.",
  "Great things in business are never done by one person. They're done by a team.",
  "Coming together is a beginning, staying together is progress, working together is success.",
  "Talent wins games, but teamwork wins championships.",
  "The strength of the team is each member. The strength of each member is the team.",
];

function getQuote(): string {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.get<TaskListResponse>("/api/tasks");
      setTasks(data.tasks);
      setError("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleCreate(title: string) {
    const newTask = await api.post<Task>("/api/tasks", { title });
    setTasks((prev) => [newTask, ...prev]);
  }

  async function handleToggle(id: string, isCompleted: boolean) {
    const updated = await api.patch<Task>(`/api/tasks/${id}`, {
      is_completed: isCompleted,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleUpdate(id: string, title: string) {
    const updated = await api.patch<Task>(`/api/tasks/${id}`, { title });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: string) {
    await api.delete(`/api/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "#737373", letterSpacing: "0.1em", fontSize: 13, textTransform: "uppercase" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero section */}
      <div style={styles.hero}>
        <h2 style={styles.heading}>My Team Task</h2>
        <p style={styles.quote}>&ldquo;{getQuote()}&rdquo;</p>
        <div style={styles.divider}></div>
      </div>

      {/* Stats bar */}
      {total > 0 && (
        <div style={styles.stats}>
          <span style={styles.statItem}>{total} total</span>
          <span style={styles.statDot}></span>
          <span style={styles.statItem}>{completed} done</span>
          <span style={styles.statDot}></span>
          <span style={styles.statItem}>{total - completed} remaining</span>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <TaskForm onSubmit={handleCreate} />
      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#0a0a0a",
    marginBottom: 12,
  },
  quote: {
    fontSize: 14,
    color: "#737373",
    fontStyle: "italic",
    lineHeight: 1.7,
    maxWidth: 480,
  },
  divider: {
    width: 40,
    height: 2,
    background: "#0a0a0a",
    marginTop: 20,
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    padding: "12px 0",
    borderTop: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
  },
  statItem: {
    fontSize: 12,
    color: "#737373",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  statDot: {
    width: 3,
    height: 3,
    background: "#a3a3a3",
    borderRadius: "50%",
    display: "inline-block",
  },
  error: {
    background: "#fafafa",
    color: "#0a0a0a",
    padding: "12px 16px",
    border: "1px solid #0a0a0a",
    fontSize: 14,
    marginBottom: 16,
  },
};
