"use client";

import { useApp } from "@/context/AppContext";
import { createDownloadBlob } from "@/lib/modGenerator";
import { downloadBlob } from "@/lib/download";
import { Package, Download, Trash2, Globe, GlobeLock } from "lucide-react";

export default function ProjectsPage() {
  const { mods, updateMod, deleteMod, user } = useApp();

  const handleDownload = async (modId: string) => {
    const mod = mods.find((m) => m.id === modId);
    if (!mod) return;
    const { blob, filename } = await createDownloadBlob(mod);
    downloadBlob(blob, filename);
  };

  const togglePublish = (id: string, published: boolean) => {
    updateMod(id, { published: !published });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted text-sm mt-1">Your AI-generated mods</p>
      </div>

      {mods.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No mods yet. Create one from the Create tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mods.map((mod) => (
            <div key={mod.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{mod.name}</h2>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{mod.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(mod.tags || []).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap">
                  {new Date(mod.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownload(mod.id)}
                  className="btn-primary text-sm px-3 py-2 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => togglePublish(mod.id, mod.published)}
                  className="px-3 py-2 rounded-xl border border-border text-sm flex items-center gap-1.5 hover:bg-card-hover"
                >
                  {mod.published ? (
                    <>
                      <GlobeLock className="w-4 h-4" /> Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" /> Publish
                    </>
                  )}
                </button>
                <button
                  onClick={() => deleteMod(mod.id)}
                  className="px-3 py-2 rounded-xl border border-danger/40 text-danger text-sm flex items-center gap-1.5 hover:bg-danger/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted">
                {mod.files?.length || 0} files · {mod.sizeEstimate} · {mod.platform || "bedrock"}
              </p>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <p className="text-center text-xs text-muted">Sign in to keep projects across devices.</p>
      )}
    </div>
  );
}
