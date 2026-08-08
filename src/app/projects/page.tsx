"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { createMcaddonBlob } from "@/lib/modGenerator";
import {
  Download,
  Trash2,
  Globe,
  GlobeLock,
  Calendar,
  FileCode,
  MoreVertical,
} from "lucide-react";

export default function ProjectsPage() {
  const { mods, updateMod, deleteMod, user } = useApp();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleDownload = async (modId: string) => {
    const mod = mods.find((m) => m.id === modId);
    if (!mod) return;
    const blob = await createMcaddonBlob(mod);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mod.name.replace(/\s+/g, "_")}.mcaddon`;
    a.click();
    URL.revokeObjectURL(url);
    setOpenMenu(null);
  };

  const togglePublish = (id: string, current: boolean) => {
    updateMod(id, { published: !current });
    setOpenMenu(null);
  };

  if (mods.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your Projects</h1>
        <p className="text-muted mb-6">No mods created yet.</p>
        <a href="/create" className="btn-primary inline-block">
          Create your first mod
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted text-sm">
          {mods.length} mod{mods.length !== 1 ? "s" : ""} • Manage, download or publish
        </p>
      </div>

      <div className="space-y-3">
        {mods.map((mod) => (
          <div key={mod.id} className="card p-4 relative">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600/50 to-violet-600/50 flex items-center justify-center text-xl font-bold shrink-0">
                {mod.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{mod.name}</h3>
                  {mod.published ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted flex items-center gap-1">
                      <GlobeLock className="w-3 h-3" /> Private
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted line-clamp-2 mt-0.5">{mod.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(mod.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {mod.files.length} files
                  </span>
                  <span>{mod.sizeEstimate}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mod.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card-hover text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === mod.id ? null : mod.id)}
                  className="p-2 rounded-lg hover:bg-card-hover text-muted"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {openMenu === mod.id && (
                  <div className="absolute right-0 top-10 z-10 w-48 card border shadow-xl py-1">
                    <button
                      onClick={() => handleDownload(mod.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-hover text-left"
                    >
                      <Download className="w-4 h-4" /> Download .mcaddon
                    </button>
                    <button
                      onClick={() => togglePublish(mod.id, mod.published)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-hover text-left"
                    >
                      {mod.published ? (
                        <>
                          <GlobeLock className="w-4 h-4" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" /> Publish Mod
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this mod?")) {
                          deleteMod(mod.id);
                          setOpenMenu(null);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-hover text-danger text-left"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <p className="text-center text-xs text-muted pt-4">
          Sign in to sync projects across devices and save to Google Drive.
        </p>
      )}
    </div>
  );
}
