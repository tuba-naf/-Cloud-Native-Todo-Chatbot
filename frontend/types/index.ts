export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
}

export interface TaskCreate {
  title: string;
}

export interface TaskUpdate {
  title?: string;
  is_completed?: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface ErrorResponse {
  detail: string;
}
