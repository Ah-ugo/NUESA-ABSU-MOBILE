"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const API_BASE_URL = "https://nuesa-absu-election.onrender.com";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: string;
  profileImage?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (matricNumber: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("auth_token"),
        AsyncStorage.getItem("user_data"),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    matricNumber: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matricNumber, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await Promise.all([
          AsyncStorage.setItem("auth_token", data.access_token),
          AsyncStorage.setItem("user_data", JSON.stringify(data.user)),
        ]);

        setToken(data.access_token);
        setUser(data.user);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${data.user.firstName}!`,
        });

        return true;
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.detail || "Invalid credentials",
        });
        return false;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: "You can now login with your credentials",
        });
        return true;
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: data.detail || "Please try again",
        });
        return false;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("auth_token"),
        AsyncStorage.removeItem("user_data"),
      ]);
      setToken(null);
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { API_BASE_URL };
