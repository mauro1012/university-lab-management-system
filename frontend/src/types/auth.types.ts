export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER';
}

export interface User {
  id: string;      
  email: string;
  role: 'ADMIN' | 'TEACHER';
  name?: string;   
}