"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { User, GeneratedMod } from "@/types";

interface AppContextType {
  user: User | null;
  mods: GeneratedMod[];
  isLoading: boolean;
  login: (username: string, email: string, password?: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addMod: (mod: Omit<GeneratedMod, "id" | "createdAt" | "updatedAt">) => GeneratedMod;
  updateMod: (id: string, data: Partial<GeneratedMod>) => void;
  deleteMod: (id: string) => void;
  connectGoogle: () => void;
  connectDrive: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "modforge_ai_data";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mods, setMods] = useState<GeneratedMod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.user) setUser(data.user);
        if (data.mods) setMods(data.mods);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, mods })
    );
  }, [user, mods, isLoading]);

  const login = useCallback((username: string, email: string) => {
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      description: "Minecraft mod creator powered by AI",
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`,
      createdAt: new Date().toISOString(),
      googleConnected: false,
      driveConnected: false,
      driveSaves: 0,
    };
    setUser(newUser);
  }, []);

  const loginWithGoogle = useCallback(() => {
    const newUser: User = {
      id: uuidv4(),
      username: "GoogleUser",
      email: "user@gmail.com",
      description: "Signed in with Google",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=google",
      createdAt: new Date().toISOString(),
      googleConnected: true,
      driveConnected: false,
      driveSaves: 0,
    };
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const addMod = useCallback(
    (modData: Omit<GeneratedMod, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newMod: GeneratedMod = {
        ...modData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      setMods((prev) => [newMod, ...prev]);
      return newMod;
    },
    []
  );

  const updateMod = useCallback((id: string, data: Partial<GeneratedMod>) => {
    setMods((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      )
    );
  }, []);

  const deleteMod = useCallback((id: string) => {
    setMods((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const connectGoogle = useCallback(() => {
    setUser((prev) =>
      prev ? { ...prev, googleConnected: true } : null
    );
  }, []);

  const connectDrive = useCallback(() => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            driveConnected: true,
            driveSaves: (prev.driveSaves || 0) + 1,
          }
        : null
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        mods,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        addMod,
        updateMod,
        deleteMod,
        connectGoogle,
        connectDrive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
