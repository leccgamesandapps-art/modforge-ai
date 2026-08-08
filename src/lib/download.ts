/** Reliable client-side file download (avoids mobile adding .zip to .mcaddon). */

export function downloadBlob(blob: Blob, filename: string) {
  // Force octet-stream so Android/Chrome don't rename to *.zip
  const safeBlob =
    blob.type === "application/zip" || blob.type === "application/x-zip-compressed"
      ? new Blob([blob], { type: "application/octet-stream" })
      : blob;

  const url = URL.createObjectURL(safeBlob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 250);
}

export function sanitizeFilename(name: string, ext: string): string {
  const base = name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60) || "ModForge_Mod";
  const cleanExt = ext.startsWith(".") ? ext : `.${ext}`;
  // strip accidental double extensions
  const withoutExt = base.replace(/\.(mcaddon|mcpack|zip|jar)$/i, "");
  return `${withoutExt}${cleanExt}`;
}
