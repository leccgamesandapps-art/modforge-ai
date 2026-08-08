"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { generateModFromPrompt, createMcaddonBlob } from "@/lib/modGenerator";
import type { GenerationStep } from "@/types";
import { Sparkles, Download, CheckCircle2, Loader2, FileCode, Image as ImageIcon, Box, Package } from "lucide-react";

const STEPS_TEMPLATE: GenerationStep[] = [
  { id: "analyze", label: "Analyzing prompt & planning structure", status: "pending" },
  { id: "bp", label: "Generating Behavior Pack (entities, items, blocks, recipes)", status: "pending" },
  { id: "rp", label: "Generating Resource Pack (textures, models, sounds, UI)", status: "pending" },
  { id: "textures", label: "AI texturing & 3D model generation", status: "pending" },
  { id: "package", label: "Packaging .mcaddon (RP + BP)", status: "pending" },
];

export default function CreatePage() {
  const { addMod, user } = useApp();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>(STEPS_TEMPLATE);
  const [progress, setProgress] = useState(0);
  const [resultMod, setResultMod] = useState<ReturnType<typeof addMod> | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  const updateStep = (id: string, status: GenerationStep["status"]) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const runGeneration = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    setResultMod(null);
    setProgress(0);
    setSteps(STEPS_TEMPLATE.map((s) => ({ ...s, status: "pending" })));
    abortRef.current = false;

    try {
      updateStep("analyze", "running");
      setProgress(10);
      await delay(800);
      if (abortRef.current) return;
      updateStep("analyze", "done");
      setProgress(25);

      updateStep("bp", "running");
      await delay(1200);
      if (abortRef.current) return;
      updateStep("bp", "done");
      setProgress(50);

      updateStep("rp", "running");
      await delay(1000);
      if (abortRef.current) return;
      updateStep("rp", "done");
      setProgress(70);

      updateStep("textures", "running");
      await delay(1400);
      if (abortRef.current) return;
      updateStep("textures", "done");
      setProgress(90);

      updateStep("package", "running");
      await delay(700);
      if (abortRef.current) return;

      const modData = generateModFromPrompt(prompt.trim());
      const saved = addMod(modData);
      setResultMod(saved);
      updateStep("package", "done");
      setProgress(100);
    } catch (e) {
      setError("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultMod) return;
    const blob = await createMcaddonBlob(resultMod);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resultMod.name.replace(/\s+/g, "_")}.mcaddon`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Mod Creator
        </h1>
        <p className="text-muted text-sm mt-1">
          Describe any Minecraft mod. The AI generates a complete Resource Pack + Behavior Pack (.mcaddon).
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <label className="block text-sm font-medium">What do you want to create?</label>
        <textarea
          className="input-field min-h-[140px] resize-y"
          placeholder="Example: A glowing crystal ore that drops magical gems, with a custom pickaxe that mines it faster and a small glowing crystal golem mob that protects the ore..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="px-2 py-1 rounded-full bg-card-hover">Blocks</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Items</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Mobs</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Armor</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Recipes</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Textures</span>
          <span className="px-2 py-1 rounded-full bg-card-hover">Models</span>
        </div>
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={runGeneration}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 spinner" />
              Generating advanced mod...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Full Mod
            </>
          )}
        </button>
      </div>

      {(isGenerating || resultMod) && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Generation Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <ul className="space-y-3">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-3 text-sm">
                {step.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : step.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-primary spinner shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0" />
                )}
                <span className={step.status === "pending" ? "text-muted" : ""}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="card p-4 border-danger/50 text-danger text-sm">{error}</div>
      )}

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
              Textures + Models
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Package className="w-4 h-4" />
              RP + BP ready
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleDownload} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download .mcaddon
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
            <ul className="mt-2 max-h-48 overflow-y-auto space-y-1 font-mono text-xs text-muted">
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
          Tip: <a href="/settings" className="text-primary underline">Sign in</a> to save mods to your account & Google Drive.
        </p>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
