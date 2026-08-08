"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { User, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, mods } = useApp();
  const [username, setUsername] = useState(user?.username || "");
  const [description, setDescription] = useState(user?.description || "");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <User className="w-12 h-12 mx-auto text-muted mb-4" />
        <h1 className="text-xl font-bold mb-2">Not signed in</h1>
        <p className="text-muted mb-6">Sign in to view and edit your profile.</p>
        <a href="/settings" className="btn-primary inline-block">
          Go to Settings
        </a>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      username: username.trim() || user.username,
      description: description.trim(),
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username.trim() || user.username)}`,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const published = mods.filter((m) => m.published);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="card p-6 space-y-5">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-2xl border-2 border-border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Username</label>
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input className="input-field opacity-60" value={user.email} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            placeholder="Tell others about your mods..."
          />
        </div>

        <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Published Mods ({published.length})</h2>
        {published.length === 0 ? (
          <p className="text-sm text-muted">No published mods yet.</p>
        ) : (
          <ul className="space-y-2">
            {published.map((m) => (
              <li key={m.id} className="text-sm flex justify-between">
                <span>{m.name}</span>
                <span className="text-muted text-xs">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
