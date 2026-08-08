"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
  setSessionUser: (sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null) => void;
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
        if (data.user && !data.user.fromGoogle) setUser(data.user);
        if (data.mods) setMods(data.mods);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, mods }));
  }, [user, mods, isLoading]);

  const setSessionUser = useCallback(
    (sessionUser: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null) => {
      if (!sessionUser || !sessionUser.email) {
        setUser((prev) => (prev?.fromGoogle ? null : prev));
        return;
      }
      setUser({
        id: `google_${sessionUser.email}`,
        username: sessionUser.name || "Google User",
        email: sessionUser.email,
        avatar:
          sessionUser.image ||
          `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(
            sessionUser.email
          )}`,
        description: "Signed in with Google",
        createdAt: new Date().toISOString(),
        googleConnected: true,
        driveConnected: true,
        driveSaves: 0,
        fromGoogle: true,
      });
    },
    []
  );

  const login = useCallback((username: string, email: string) => {
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      description: "Minecraft mod creator powered by AI",
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(
        username
      )}`,
      createdAt: new Date().toISOString(),
      googleConnected: false,
      driveConnected: false,
      driveSaves: 0,
      fromGoogle: false,
    };
    setUser(newUser);
  }, []);

  const loginWithGoogle = useCallback(() => {}, []);

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

  const connectGoogle = useCallback(() => {}, []);

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
        setSessionUser,
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
