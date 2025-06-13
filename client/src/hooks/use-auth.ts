import { useState, useEffect } from "react";
import { authService, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If we have a token but no user, try to fetch the current user
    if (authService.getToken() && !user) {
      setIsLoading(true);
      authService
        .getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid, logout
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const verifyEmail = async (token: string) => {
    return await authService.verifyEmail(token);
  };

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    return await authService.resetPassword(token, password);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };
}
