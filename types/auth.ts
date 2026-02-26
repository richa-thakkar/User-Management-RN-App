export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthState {
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
