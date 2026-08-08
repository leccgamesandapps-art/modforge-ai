"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Globe } from "lucide-react";

export default function SearchPage() {
  const { mods } = useApp();
  const [query, setQuery] = useState("");

  const published = useMemo(
    () =>
      mods.filter(
        (m) =>
          m.published &&
          (m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase()) ||
            m.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
      ),
    [mods, query]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Search className="w-6 h-6 text-primary" />
        Search Published Mods
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          className="input-field pl-11"
          placeholder="Search by name, description or tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {published.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>
            {query
              ? "No published mods match your search."
              : "No published mods yet. Publish one from Projects!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((mod) => (
            <div key={mod.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold">
                  {mod.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{mod.name}</h3>
                  <p className="text-xs text-muted truncate">{mod.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {mod.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
