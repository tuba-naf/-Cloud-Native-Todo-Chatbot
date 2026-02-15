"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => Promise<void>;
  onUpdate: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await onToggle(task.id, !task.is_completed);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === task.title) {
      setEditing(false);
      setEditTitle(task.title);
      return;
    }
    setLoading(true);
    try {
      await onUpdate(task.id, trimmed);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setEditTitle(task.title);
    }
  }

  return (
    <div
      style={{
        ...styles.item,
        background: task.is_completed ? "#f5f5f5" : "#fff",
      }}
    >
      <div style={styles.left}>
        <div
          onClick={handleToggle}
          style={{
            ...styles.checkbox,
            background: task.is_completed ? "#0a0a0a" : "transparent",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {task.is_completed && (
            <span style={styles.checkmark}>&#10003;</span>
          )}
        </div>
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={500}
            style={styles.editInput}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            style={{
              ...styles.title,
              textDecoration: task.is_completed ? "line-through" : "none",
              color: task.is_completed ? "#a3a3a3" : "#0a0a0a",
            }}
          >
            {task.title}
          </span>
        )}
      </div>
      <div style={styles.right}>
        <span style={styles.date}>{formatDate(task.created_at)}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={styles.actionBtn}
            title="Edit"
          >
            edit
          </button>
        )}
        <button
          onClick={handleDelete}
          onBlur={() => setConfirming(false)}
          style={confirming ? styles.confirmBtn : styles.actionBtn}
          title={confirming ? "Click again to confirm" : "Delete"}
        >
          {confirming ? "confirm?" : "delete"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #e0e0e0",
    gap: 12,
    transition: "background 0.15s",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    border: "1.5px solid #0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  checkmark: {
    color: "#fafafa",
    fontSize: 12,
    lineHeight: 1,
  },
  title: {
    fontSize: 15,
    cursor: "default",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: "color 0.15s",
  },
  editInput: {
    flex: 1,
    padding: "4px 8px",
    border: "1px solid #0a0a0a",
    fontSize: 15,
    outline: "none",
    background: "#fff",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  date: {
    fontSize: 11,
    color: "#a3a3a3",
    whiteSpace: "nowrap",
    letterSpacing: "0.02em",
  },
  actionBtn: {
    padding: "2px 0",
    background: "transparent",
    color: "#a3a3a3",
    border: "none",
    borderBottom: "1px solid transparent",
    fontSize: 12,
    letterSpacing: "0.02em",
  },
  confirmBtn: {
    padding: "2px 8px",
    background: "#0a0a0a",
    color: "#fafafa",
    border: "1px solid #0a0a0a",
    fontSize: 12,
    letterSpacing: "0.02em",
  },
};
