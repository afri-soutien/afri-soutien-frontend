import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data: AuthResponse = await response.json();
    
    this.setAuth(data.token, data.user);
    return data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ message: string; user: User }> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return await response.json();
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiRequest("GET", `/api/auth/verify-email?token=${token}`);
    return await response.json();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
    return await response.json();
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiRequest("POST", "/api/auth/reset-password", { token, password });
    return await response.json();
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error("No authentication token");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    this.user = data.user;
    localStorage.setItem("auth_user", JSON.stringify(this.user));
    return data.user;
  }

  private setAuth(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  isAdmin(): boolean {
    return this.user?.role === "admin";
  }
}

export const authService = new AuthService();
