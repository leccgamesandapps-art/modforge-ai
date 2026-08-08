"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { LogIn, LogOut, HardDrive, Chrome, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const {
    user,
    login,
    loginWithGoogle,
    logout,
    connectGoogle,
    connectDrive,
  } = useApp();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !email.trim()) {
      setError("Username and email are required");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters (demo)");
      return;
    }
    login(username.trim(), email.trim());
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt="" className="w-12 h-12 rounded-xl" />
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">Connections</h2>

          <button
            onClick={connectGoogle}
            disabled={user.googleConnected}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-card-hover transition disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <Chrome className="w-5 h-5" />
              Connect Google
            </span>
            <span className="text-xs text-muted">
              {user.googleConnected ? "Connected" : "Not connected"}
            </span>
          </button>

          <button
            onClick={connectDrive}
            disabled={!user.googleConnected}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-card-hover transition disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <HardDrive className="w-5 h-5" />
              Connect Google Drive
            </span>
            <span className="text-xs text-muted">
              {user.driveConnected
                ? `${user.driveSaves || 0} saves`
                : "Requires Google"}
            </span>
          </button>

          {user.driveConnected && (
            <p className="text-xs text-muted px-1">
              Total Google Drive Cloud Saves: {user.driveSaves || 0}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {mode === "login" ? "Sign In" : "Sign Up"}
      </h1>

      <div className="card p-5 space-y-4">
        <div className="flex rounded-xl overflow-hidden border border-border">
          <button
            className={`flex-1 py-2.5 text-sm font-medium ${
              mode === "login" ? "bg-primary text-white" : "bg-transparent text-muted"
            }`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium ${
              mode === "signup" ? "bg-primary text-white" : "bg-transparent text-muted"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="YourUsername"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            {mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card text-muted">or</span>
          </div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-card-hover transition font-medium"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>
      </div>

      <p className="text-xs text-muted text-center">
        Demo authentication — data is stored locally in your browser.
        Full production would use secure auth + database.
      </p>
    </div>
  );
}
