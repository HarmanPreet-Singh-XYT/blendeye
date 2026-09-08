"use client";

import type { CinemaAsset } from "@/lib/supabase-store";

export type { CinemaAsset };

export type AssetCategory =
  | "map"
  | "character_face"
  | "character_body"
  | "location"
  | "style"
  | "video"
  | "audio"
  | "general";

export type AssetType = "image" | "video" | "map" | "audio";

const STORAGE_KEY = "agentic_cinema_assets_v1";

// Seeded Curated Assets for instantaneous preview (Maps are left empty for user uploads)
export const SEED_ASSETS: CinemaAsset[] = [
  {
    id: "seed-face-marcus",
    name: "Marcus — Chiaroscuro 85mm AI Headshot",
    type: "image",
    category: "character_face",
    url: "/assets/characters/ai_marcus_face.jpg",
    thumbnailUrl: "/assets/characters/ai_marcus_face.jpg",
    sizeBytes: 801000,
    mimeType: "image/jpeg",
    tags: ["face", "marcus", "detective", "headshot", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Marcus",
      lens: "85mm Master Prime",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1710000020000,
  },
  {
    id: "seed-face-elena",
    name: "Elena — Cyberpunk Infiltrator AI Likeness",
    type: "image",
    category: "character_face",
    url: "/assets/characters/ai_elena_face.jpg",
    thumbnailUrl: "/assets/characters/ai_elena_face.jpg",
    sizeBytes: 916000,
    mimeType: "image/jpeg",
    tags: ["face", "elena", "hacker", "portrait", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Elena",
      lens: "50mm Anamorphic",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1710000030000,
  },
  {
    id: "seed-loc-vault",
    name: "Sub-Level Concrete Vault (AI Plate)",
    type: "image",
    category: "location",
    url: "/assets/locations/ai_vault_plate.jpg",
    thumbnailUrl: "/assets/locations/ai_vault_plate.jpg",
    sizeBytes: 812000,
    mimeType: "image/jpeg",
    tags: ["location", "vault", "plate", "moodboard", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "Industrial Brutalism & Volumetric Haze",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1710000040000,
  },
  {
    id: "seed-loc-pier",
    name: "Rain-Slicked Pier Docks (AI Plate)",
    type: "image",
    category: "location",
    url: "/assets/locations/ai_pier_plate.jpg",
    thumbnailUrl: "/assets/locations/ai_pier_plate.jpg",
    sizeBytes: 742000,
    mimeType: "image/jpeg",
    tags: ["location", "pier", "rain", "neo-noir", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "Neo-Noir Rain & Sodium Vapor",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1710000050000,
  },
  {
    id: "seed-style-grain",
    name: "Anamorphic Cyberpunk Flare (AI Plate)",
    type: "image",
    category: "style",
    url: "/assets/locations/ai_style_plate.jpg",
    thumbnailUrl: "/assets/locations/ai_style_plate.jpg",
    sizeBytes: 698000,
    mimeType: "image/jpeg",
    tags: ["style", "anamorphic", "palette", "grading", "ai-generated"],
    metadata: {
      preset: true,
      palette: ["#0f172a", "#38bdf8", "#f59e0b"],
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1710000060000,
  },
  {
    id: "seed-video-take1",
    name: "Vault Heist Master Cam — Take 01",
    type: "video",
    category: "video",
    url: "/videos/vault_heist_take_01.mp4",
    thumbnailUrl: null,
    sizeBytes: 2500000,
    mimeType: "video/mp4",
    tags: ["video", "veo", "master", "take"],
    metadata: {
      preset: true,
      durationSec: 6,
      model: "Google Veo 3.1",
    },
    createdAt: 1710000070000,
  },
];

/**
 * Read all stored assets from browser storage, merged with seeded assets.
 */
export function getLocalAssets(): CinemaAsset[] {
  if (typeof window === "undefined") return SEED_ASSETS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ASSETS));
      return SEED_ASSETS;
    }
    const parsed: CinemaAsset[] = JSON.parse(raw);
    // Ensure all seed assets are present
    const map = new Map<string, CinemaAsset>();
    for (const a of SEED_ASSETS) map.set(a.id, a);
    for (const a of parsed) map.set(a.id, a);
    return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.warn("[AssetStore] Could not read local assets:", err);
    return SEED_ASSETS;
  }
}

/**
 * Save an asset to local storage and dispatch update event.
 */
export function saveLocalAsset(asset: CinemaAsset): CinemaAsset[] {
  if (typeof window === "undefined") return [asset];

  try {
    const current = getLocalAssets();
    const existingIndex = current.findIndex((a) => a.id === asset.id);
    let updated: CinemaAsset[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...asset };
    } else {
      updated = [asset, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cinema-assets-updated", { detail: updated }));
    return updated;
  } catch (err) {
    console.warn("[AssetStore] Could not save local asset:", err);
    return getLocalAssets();
  }
}

/**
 * Delete an asset from local storage and dispatch update event.
 */
export function deleteLocalAsset(assetId: string): CinemaAsset[] {
  if (typeof window === "undefined") return [];

  try {
    const current = getLocalAssets();
    const updated = current.filter((a) => a.id !== assetId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cinema-assets-updated", { detail: updated }));
    return updated;
  } catch (err) {
    console.warn("[AssetStore] Could not delete local asset:", err);
    return getLocalAssets();
  }
}

/**
 * Upload a file to the backend, save to local store, and return asset.
 */
export async function uploadAssetFile(
  file: File,
  options?: {
    name?: string;
    category?: AssetCategory;
    projectId?: string;
    tags?: string[];
  }
): Promise<CinemaAsset> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.name) formData.append("name", options.name);
  if (options?.category) formData.append("category", options.category);
  if (options?.projectId) formData.append("projectId", options.projectId);
  if (options?.tags && options.tags.length > 0) {
    formData.append("tags", JSON.stringify(options.tags));
  }

  const res = await fetch("/api/assets/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.asset) {
    throw new Error("Upload response missing asset data");
  }

  saveLocalAsset(data.asset);
  return data.asset;
}

/**
 * Category metadata helper
 */
export const ASSET_CATEGORIES: Array<{
  id: AssetCategory | "all";
  label: string;
  desc: string;
  iconName: string;
}> = [
  { id: "all", label: "All Assets", desc: "Full production asset library", iconName: "Layers" },
  { id: "map", label: "Maps & Floor Plans", desc: "Top-level building maps and architectural blueprints", iconName: "MapPin" },
  { id: "character_face", label: "Character Faces", desc: "Close-up headshots and likeness references", iconName: "User" },
  { id: "character_body", label: "Character Wardrobe", desc: "Full-body silhouettes, costumes, and stances", iconName: "Shirt" },
  { id: "location", label: "Location Plates", desc: "Scouted location plates, architecture, and environments", iconName: "Building2" },
  { id: "style", label: "Style & Color Mood", desc: "Lighting references, color palettes, and cinematic LUTs", iconName: "Sparkles" },
  { id: "video", label: "Video Footage & Takes", desc: "Generated Veo takes and live b-roll footage", iconName: "Video" },
  { id: "audio", label: "Audio & Stems", desc: "Lyria scores, voice takes, and ambient tracks", iconName: "Volume2" },
];
