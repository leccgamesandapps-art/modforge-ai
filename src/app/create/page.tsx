"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { generateModFromPrompt, createDownloadBlob } from "@/lib/modGenerator";
import { downloadBlob } from "@/lib/download";
import type { GenerationStep, ModPlatform } from "@/types";
import { Sparkles, Download, Loader2, FileCode, Image as ImageIcon, Box, Package } from "lucide-react";

export default function CreatePage() {
  const { addMod, user } = useApp();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<ModPlatform>("bedrock");
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [resultMod, setResultMod] = useState<ReturnType<typeof addMod> | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  const buildSteps = (p: ModPlatform): GenerationStep[] => {
    if (p === "java") {
      return [
        { id: "analyze", label: "Analyzing prompt & planning mod structure", status: "pending" },
        { id: "code", label: "Generating Java sources (.java) + Fabric entrypoints", status: "pending" },
        { id: "data", label: "Generating data packs (recipes, loot, lang, models)", status: "pending" },
        { id: "assets", label: "Generating textures, icons & resources", status: "pending" },
        { id: "package", label: "Packaging Fabric project (.zip)", status: "pending" },
      ];
    }
    return [
      { id: "analyze", label: "Analyzing prompt & planning structure", status: "pending" },
      { id: "bp", label: "Generating Behavior Pack (entities, items, blocks, recipes, scripts)", status: "pending" },
      { id: "rp", label: "Generating Resource Pack (textures, models, animations, UI)", status: "pending" },
      { id: "textures", label: "AI texturing & 3D model generation", status: "pending" },
      { id: "package", label: "Packaging .mcaddon (RP + BP)", status: "pending" },
    ];
  };

  const updateStep = (id: string, status: GenerationStep["status"]) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const runGeneration = async () => {
    if (!prompt.trim() || isGenerating) return;
    abortRef.current = false;
    setError("");
    setResultMod(null);
    setIsGenerating(true);
    setProgress(0);
    const stepList = buildSteps(platform);
    setSteps(stepList);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      for (let i = 0; i < stepList.length; i++) {
        if (abortRef.current) return;
        const step = stepList[i];
        updateStep(step.id, "running");
        await delay(platform === "java" ? 700 + i * 200 : 800 + i * 250);
        if (abortRef.current) return;
        updateStep(step.id, "done");
        setProgress(Math.round(((i + 1) / stepList.length) * 100));
      }

      const modData = generateModFromPrompt(prompt.trim(), platform);
      const saved = addMod(modData);
      setResultMod(saved);
    } catch (e) {
      setError("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultMod) return;
    const { blob, filename } = await createDownloadBlob(resultMod);
    downloadBlob(blob, filename);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Mod Creator
        </h1>
        <p className="text-muted text-sm mt-1">
          Describe any Minecraft mod. Choose Java or Bedrock. Get a full downloadable pack.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <label className="block text-sm font-medium">What do you want to create?</label>
        <textarea
          className="input-field min-h-[140px] resize-y"
          placeholder="Example: A throwable grenade that explodes on impact, with a custom texture, projectile entity, and crafting recipe..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setPlatform("bedrock")}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                platform === "bedrock"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border hover:bg-card-hover"
              }`}
            >
              Bedrock
              <span className="block text-[10px] opacity-70 font-normal">.mcaddon · RP + BP</span>
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setPlatform("java")}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                platform === "java"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border hover:bg-card-hover"
              }`}
            >
              Java (Fabric)
              <span className="block text-[10px] opacity-70 font-normal">.zip · sources + assets</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {["Blocks", "Items", "Mobs", "Armor", "Recipes", "Textures", "Models"].map((t) => (
            <span key={t} className="px-2 py-1 rounded-full bg-card-hover">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={runGeneration}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 spinner" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Full Mod
            </>
          )}
        </button>
      </div>

      {(isGenerating || progress > 0) && steps.length > 0 && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Generation Progress</span>
            <span className="text-muted">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-card-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-2 text-sm">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-2">
                {step.status === "done" ? (
                  <span className="text-primary">✓</span>
                ) : step.status === "running" ? (
                  <Loader2 className="w-4 h-4 text-primary spinner shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-border shrink-0 inline-block" />
                )}
                <span className={step.status === "pending" ? "text-muted" : ""}>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="card p-4 border-danger/50 text-danger text-sm">{error}</div>}

      {resultMod && (
        <div className="card p-5 space-y-4 border-primary/30">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{resultMod.name}</h2>
              <p className="text-sm text-muted mt-0.5">{resultMod.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {resultMod.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <FileCode className="w-4 h-4" />
              {resultMod.files.length} files
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Box className="w-4 h-4" />
              {resultMod.sizeEstimate}
            </div>
            <div className="flex items-center gap-2 text-muted">
              <ImageIcon className="w-4 h-4" />
              Real PNG textures
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Package className="w-4 h-4" />
              {resultMod.platform === "java" ? "Fabric sources" : "RP + BP · .mcaddon"}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleDownload} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download {resultMod.platform === "java" ? ".zip" : ".mcaddon"}
            </button>
            <button
              onClick={() => router.push("/projects")}
              className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-card-hover transition font-medium"
            >
              View in Projects
            </button>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted hover:text-foreground">
              Preview generated files ({resultMod.files.length})
            </summary>
            <ul className="mt-2 max-h-56 overflow-y-auto space-y-1 font-mono text-xs text-muted">
              {resultMod.files.map((f) => (
                <li key={f.path} className="truncate">
                  {f.path}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {!user && (
        <p className="text-center text-xs text-muted">
          Tip:{" "}
          <a href="/settings" className="text-primary underline">
            Sign in
          </a>{" "}
          to save mods to your account.
        </p>
      )}
    </div>
  );
}
