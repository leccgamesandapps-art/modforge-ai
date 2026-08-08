export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  description?: string;
  googleConnected?: boolean;
  driveConnected?: boolean;
  driveSaves?: number;
  createdAt: string;
  fromGoogle?: boolean;
}

export interface ModFile {
  path: string;
  content: string;
  type: "json" | "lang" | "mcfunction" | "png" | "other";
}

export interface GeneratedMod {
  id: string;
  name: string;
  description: string;
  prompt: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  files: ModFile[];
  packIcon?: string;
  tags: string[];
  sizeEstimate: string;
}

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
}
