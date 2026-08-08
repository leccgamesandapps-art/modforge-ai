"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Sparkles, Calendar, Download, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { user, mods, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <section className="card p-6">
        {user ? (
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar || ""}
              alt={user.username}
              className="w-16 h-16 rounded-2xl border border-border"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{user.username}</h1>
              <p className="text-sm text-muted mt-0.5">{user.email}</p>
              <p className="text-sm text-muted/80 mt-2 line-clamp-2">
                {user.description || "No description yet."}
              </p>
              <div className="flex gap-3 mt-3 text-xs text-muted">
                <span>{mods.length} mods</span>
                <span>•</span>
                <span>{mods.filter((m) => m.published).length} published</span>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              Edit <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Welcome to ModForge AI</h1>
            <p className="text-muted text-sm mb-4 max-w-sm mx-auto">
              Create advanced Minecraft Resource Packs & Behavior Packs from plain text. No coding required.
            </p>
            <Link href="/settings" className="btn-primary inline-block">
              Sign In / Sign Up
            </Link>
          </div>
        )}
      </section>

      <Link
        href="/create"
        className="card p-5 flex items-center gap-4 hover:border-primary/50 group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Create a new mod</h2>
          <p className="text-sm text-muted">Describe anything — blocks, items, mobs, full packs</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition" />
      </Link>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Your Mods</h2>
          {mods.length > 0 && (
            <Link href="/projects" className="text-sm text-primary">
              View all
            </Link>
          )}
        </div>

        {mods.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            <p>No mods yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mods.slice(0, 5).map((mod) => (
              <Link
                key={mod.id}
                href="/projects"
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/40 to-violet-600/40 flex items-center justify-center text-lg font-bold">
                  {mod.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{mod.name}</h3>
                  <p className="text-xs text-muted truncate">{mod.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <Calendar className="w-3 h-3" />
                    {new Date(mod.createdAt).toLocaleDateString()}
                    {mod.published && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">
                        Published
                      </span>
                    )}
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
