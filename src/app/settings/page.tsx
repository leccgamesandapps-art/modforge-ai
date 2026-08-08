"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, HardDrive, Chrome, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const { user, login, logout, connectDrive, setSessionUser } = useApp();
  const { data: session, status } = useSession();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      setSessionUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    } else {
      setSessionUser(null);
    }
  }, [session, status, setSessionUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setAuthError(
          err === "Configuration"
            ? "Google login is not configured yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Vercel."
            : `Auth error: ${err}`
        );
      }
    }
  }, []);

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

  const handleGoogleSignIn = () => {
    setAuthError("");
    signIn("google", { callbackUrl: "/settings" });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/settings" });
    logout();
  };

  const displayUser = user;

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full spinner" />
      </div>
    );
  }

  if (displayUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUser.avatar || ""}
              alt=""
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-semibold">{displayUser.username}</p>
              <p className="text-sm text-muted">{displayUser.email}</p>
              {displayUser.fromGoogle && (
                <p className="text-xs text-primary mt-0.5">Signed in with Google</p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">
            Connections
          </h2>

          <div className="w-full flex items-center justify-between p-3 rounded-xl border border-border">
            <span className="flex items-center gap-3">
              <Chrome className="w-5 h-5" />
              Google Account
            </span>
            <span className="text-xs text-success">
              {displayUser.googleConnected || displayUser.fromGoogle
                ? "Connected"
                : "Not connected"}
            </span>
          </div>

          <button
            onClick={connectDrive}
            disabled={!displayUser.googleConnected && !displayUser.fromGoogle}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-card-hover transition disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <HardDrive className="w-5 h-5" />
              Google Drive
            </span>
            <span className="text-xs text-muted">
              {displayUser.driveConnected
                ? `${displayUser.driveSaves || 0} saves`
                : displayUser.fromGoogle
                ? "Connected (scope granted)"
                : "Requires Google"}
            </span>
          </button>

          {displayUser.driveConnected && (
            <p className="text-xs text-muted px-1">
              Total Google Drive Cloud Saves: {displayUser.driveSaves || 0}
            </p>
          )}
        </div>

        <button
          onClick={handleSignOut}
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

      {authError && (
        <div className="card p-4 border-danger/40 text-danger text-sm">
          {authError}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div className="flex rounded-xl overflow-hidden border border-border">
          <button
            className={`flex-1 py-2.5 text-sm font-medium ${
              mode === "login"
                ? "bg-primary text-white"
                : "bg-transparent text-muted"
            }`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium ${
              mode === "signup"
                ? "bg-primary text-white"
                : "bg-transparent text-muted"
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
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
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
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-card-hover transition font-medium"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>
        <p className="text-xs text-muted text-center">
          Opens the official Google Sign-In page
        </p>
      </div>

      <p className="text-xs text-muted text-center">
        Local username/password is stored in your browser only.
        Google uses official OAuth (requires AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET on Vercel).
      </p>
    </div>
  );
}
