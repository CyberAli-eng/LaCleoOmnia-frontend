export interface User {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
