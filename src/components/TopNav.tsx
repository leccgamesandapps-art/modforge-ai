"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Search, User, Settings, Menu, Sparkles } from "lucide-react";
import { useState } from "react";

export default function TopNav() {
  const { user } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0d1410]/90 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm hidden sm:block tracking-tight">
          ModForge<span className="text-primary">AI</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-1 ml-4">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            pathname === "/" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"
          }`}
        >
          Home
        </Link>
        <Link
          href="/create"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            pathname === "/create" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"
          }`}
        >
          Create
        </Link>
        <Link
          href="/projects"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            pathname === "/projects" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"
          }`}
        >
          Projects
        </Link>
      </nav>

      <div className="flex-1" />

      <Link
        href="/search"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-muted hover:text-foreground transition text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search published mods</span>
      </Link>

      <Link
        href="/profile"
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-card transition"
      >
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.username}
            className="w-8 h-8 rounded-full border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <User className="w-4 h-4 text-muted" />
          </div>
        )}
      </Link>

      <Link
        href="/settings"
        className="p-2 rounded-xl hover:bg-card transition text-muted hover:text-foreground"
      >
        <Settings className="w-5 h-5" />
      </Link>

      <button
        className="md:hidden p-2 rounded-xl hover:bg-card text-muted"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border p-3 flex flex-col gap-1 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-card-hover">
            Home
          </Link>
          <Link href="/create" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-card-hover">
            Create
          </Link>
          <Link href="/projects" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-card-hover">
            Projects
          </Link>
        </div>
      )}
    </header>
  );
}
