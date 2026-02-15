"use client";

import type { Task } from "@/types";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, isCompleted: boolean) => Promise<void>;
  onUpdate: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskList({ tasks, onToggle, onUpdate, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    borderTop: "1px solid #e0e0e0",
  },
};
