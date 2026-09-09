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

import { getActiveUserId } from "@/lib/project-store";

export type AssetType = "image" | "video" | "map" | "audio";

export function getAssetsStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : getActiveUserId();
  return uid ? `agentic_cinema_assets_u_${uid}` : "agentic_cinema_assets_v1";
}

// Seeded Curated Assets for instantaneous preview (Aethelgard: The Chronos Shift production)
// All URLs are local — no Supabase dependency, no network calls, no bucket permissions needed.
export const SEED_ASSETS: CinemaAsset[] = [
  {
    id: "aeth-char-julian",
    name: "Julian Ross — 85mm Prime Portrait",
    type: "image",
    category: "character_face",
    url: "/cinema/characters/julian_portrait.jpg",
    thumbnailUrl: "/cinema/characters/julian_portrait.jpg",
    sizeBytes: 801000,
    mimeType: "image/jpeg",
    tags: ["face", "julian", "pilot", "portrait", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Julian Ross",
      lens: "85mm Master Prime",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788918378000,
  },
  {
    id: "aeth-body-julian",
    name: "Julian Ross — Full-Length Concept Art",
    type: "image",
    category: "character_body",
    url: "/cinema/characters/julian_fullbody.jpg",
    thumbnailUrl: "/cinema/characters/julian_fullbody.jpg",
    sizeBytes: 850000,
    mimeType: "image/jpeg",
    tags: ["body", "costume", "julian", "pilot", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Julian Ross",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788921611000,
  },
  {
    id: "aeth-char-maya",
    name: "Dr. Maya Lin — 85mm Prime Portrait",
    type: "image",
    category: "character_face",
    url: "/cinema/characters/maya_portrait.jpg",
    thumbnailUrl: "/cinema/characters/maya_portrait.jpg",
    sizeBytes: 916000,
    mimeType: "image/jpeg",
    tags: ["face", "maya", "astrophysicist", "portrait", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Dr. Maya Lin",
      lens: "85mm Master Prime",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788918418000,
  },
  {
    id: "aeth-body-maya",
    name: "Dr. Maya Lin — Full-Length Concept Art",
    type: "image",
    category: "character_body",
    url: "/cinema/characters/maya_fullbody.jpg",
    thumbnailUrl: "/cinema/characters/maya_fullbody.jpg",
    sizeBytes: 870000,
    mimeType: "image/jpeg",
    tags: ["body", "costume", "maya", "astrophysicist", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "Dr. Maya Lin",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788921623000,
  },
  {
    id: "aeth-char-aura",
    name: "AURA-9 — Holographic Core Likeness",
    type: "image",
    category: "character_face",
    url: "/cinema/characters/aura_portrait.jpg",
    thumbnailUrl: "/cinema/characters/aura_portrait.jpg",
    sizeBytes: 780000,
    mimeType: "image/jpeg",
    tags: ["face", "aura-9", "ai", "oracle", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "AURA-9",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788918467000,
  },
  {
    id: "aeth-body-aura",
    name: "AURA-9 — Full-Length Architecture Concept",
    type: "image",
    category: "character_body",
    url: "/cinema/characters/aura_fullbody.jpg",
    thumbnailUrl: "/cinema/characters/aura_fullbody.jpg",
    sizeBytes: 820000,
    mimeType: "image/jpeg",
    tags: ["body", "costume", "aura-9", "ai", "ai-generated"],
    metadata: {
      preset: true,
      characterName: "AURA-9",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788921636000,
  },
  {
    id: "aeth-loc-laurel",
    name: "Laurel Canyon Stages — Cockpit Stage Plate",
    type: "image",
    category: "location",
    url: "/cinema/locations/laurel_canyon_cockpit.jpg",
    thumbnailUrl: "/cinema/locations/laurel_canyon_cockpit.jpg",
    sizeBytes: 812000,
    mimeType: "image/jpeg",
    tags: ["location", "cockpit", "laurel-canyon", "stage", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "Tactile flight switchgear, analog flight telemetry, strobe-cyan emergency luminescence",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788919079000,
  },
  {
    id: "aeth-loc-fonco",
    name: "Fonco Studios — Modular Cockpit Plate",
    type: "image",
    category: "location",
    url: "/cinema/locations/fonco_cockpit.jpg",
    thumbnailUrl: "/cinema/locations/fonco_cockpit.jpg",
    sizeBytes: 742000,
    mimeType: "image/jpeg",
    tags: ["location", "cockpit", "fonco", "modular", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "Modular spaceship cockpit & insert stage with tactile hydraulic gimbal mounts",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788919099000,
  },
  {
    id: "aeth-loc-castle",
    name: "L.A. Castle Studios — Cockpit LED Volume",
    type: "image",
    category: "location",
    url: "/cinema/locations/la_castle_volume.jpg",
    thumbnailUrl: "/cinema/locations/la_castle_volume.jpg",
    sizeBytes: 890000,
    mimeType: "image/jpeg",
    tags: ["location", "volume", "led", "la-castle", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "Unreal Engine in-camera VFX LED volume projecting singularity redshift reflections",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788919113000,
  },
  {
    id: "aeth-loc-obs",
    name: "Accretion Observation Deck — Wide Plate",
    type: "image",
    category: "location",
    url: "/cinema/locations/observation_deck_wide.jpg",
    thumbnailUrl: "/cinema/locations/observation_deck_wide.jpg",
    sizeBytes: 840000,
    mimeType: "image/jpeg",
    tags: ["location", "observation-deck", "singularity", "plate", "ai-generated"],
    metadata: {
      preset: true,
      aesthetic: "24mm prime architectural wide establishing shot of panoramic observation viewport",
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788919849000,
  },
  {
    id: "aeth-style-scope",
    name: "2.39:1 Anamorphic Scope (Accretion Horizon)",
    type: "image",
    category: "style",
    url: "/cinema/scenes/scene_1_storyboard_accretion.jpg",
    thumbnailUrl: "/cinema/scenes/scene_1_storyboard_accretion.jpg",
    sizeBytes: 940000,
    mimeType: "image/jpeg",
    tags: ["style", "anamorphic", "storyboard", "scope", "ai-generated"],
    metadata: {
      preset: true,
      palette: ["#020617", "#06b6d4", "#f59e0b"],
      aiGenerated: true,
      generator: "Imagen 3 Generative AI",
    },
    createdAt: 1788919223000,
  },
  {
    id: "aeth-video-take1",
    name: "Accretion Ergosphere Crossing — Take 01",
    type: "video",
    category: "video",
    url: "/cinema/videos/chronos_take_01.mp4",
    thumbnailUrl: "/cinema/scenes/scene_1_storyboard_accretion.jpg",
    sizeBytes: 2400000,
    mimeType: "video/mp4",
    tags: ["video", "veo", "master", "cockpit", "take"],
    metadata: {
      preset: true,
      durationSec: 5,
      model: "Google Veo 3.1",
    },
    createdAt: 1788919575000,
  },
  {
    id: "aeth-video-take2",
    name: "Cockpit Perigee High-G Burn — Take 02",
    type: "video",
    category: "video",
    url: "/cinema/videos/chronos_take_02.mp4",
    thumbnailUrl: "/cinema/locations/observation_deck_wide.jpg",
    sizeBytes: 2500000,
    mimeType: "video/mp4",
    tags: ["video", "veo", "cockpit", "burn", "take"],
    metadata: {
      preset: true,
      durationSec: 5,
      model: "Google Veo 3.1",
    },
    createdAt: 1788919924000,
  },
  {
    id: "aeth-score-take1",
    name: "Singularity Ergosphere Slingshot Theme — Score 01",
    type: "audio",
    category: "audio",
    url: "/cinema/audio/chronos_score_01.mp3",
    thumbnailUrl: null,
    sizeBytes: 720000,
    mimeType: "audio/mpeg",
    tags: ["score", "lyria", "music", "slingshot"],
    metadata: {
      preset: true,
      durationSec: 30,
      model: "Google Lyria Audio Model",
    },
    createdAt: 1788920005000,
  },
  {
    id: "aeth-score-take2",
    name: "Temporal Echo Paradox Ambient Suite — Score 02",
    type: "audio",
    category: "audio",
    url: "/cinema/audio/chronos_score_02.mp3",
    thumbnailUrl: null,
    sizeBytes: 710000,
    mimeType: "audio/mpeg",
    tags: ["score", "lyria", "music", "paradox"],
    metadata: {
      preset: true,
      durationSec: 30,
      model: "Google Lyria Audio Model",
    },
    createdAt: 1788919675000,
  },
  {
    id: "aeth-map-cockpit",
    name: "Chronos Cockpit Tactical Deck Plan",
    type: "map",
    category: "map",
    url: "/cinema/maps/cockpit_deck_plan.png",
    thumbnailUrl: "/cinema/maps/cockpit_deck_plan.png",
    sizeBytes: 520000,
    mimeType: "image/png",
    tags: ["map", "cockpit", "floorplan", "tactical"],
    metadata: {
      preset: true,
      sceneId: "scene-chronos-1",
    },
    createdAt: 1788919240000,
  },
];

/**
 * Read all stored assets from browser storage, merged with seeded assets.
 */
export function getLocalAssets(userId?: string | null): CinemaAsset[] {
  if (typeof window === "undefined") return SEED_ASSETS;

  try {
    const key = getAssetsStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(SEED_ASSETS));
      return SEED_ASSETS;
    }
    const parsed: CinemaAsset[] = JSON.parse(raw);
    
    // Auto-migrate: Purge legacy assets (vault-heist/marcus/elena)
    const hasLegacy = parsed.some(
      (a) =>
        a.id?.includes("marcus") ||
        a.id?.includes("elena") ||
        a.url?.includes("ai_vault_plate") ||
        a.id?.startsWith("seed-")
    );
    if (hasLegacy) {
      // Re-seed from fresh local assets while preserving non-legacy user assets
      const nonLegacy = parsed.filter(
        (a) =>
          !a.id?.includes("marcus") &&
          !a.id?.includes("elena") &&
          !a.url?.includes("ai_vault_plate") &&
          !a.id?.startsWith("seed-")
      );
      const combined = [...SEED_ASSETS, ...nonLegacy];
      localStorage.setItem(key, JSON.stringify(combined));
      return combined;
    }

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
export function saveLocalAsset(asset: CinemaAsset, userId?: string | null): CinemaAsset[] {
  if (typeof window === "undefined") return [asset];

  try {
    const key = getAssetsStorageKey(userId);
    const current = getLocalAssets(userId);
    const existingIndex = current.findIndex((a) => a.id === asset.id);
    let updated: CinemaAsset[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...asset };
    } else {
      updated = [asset, ...current];
    }
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cinema-assets-updated", { detail: updated }));
    return updated;
  } catch (err) {
    console.warn("[AssetStore] Could not save local asset:", err);
    return getLocalAssets(userId);
  }
}

/**
 * Delete an asset from local storage and dispatch update event.
 */
export function deleteLocalAsset(assetId: string, userId?: string | null): CinemaAsset[] {
  if (typeof window === "undefined") return [];

  try {
    const key = getAssetsStorageKey(userId);
    const current = getLocalAssets(userId);
    const updated = current.filter((a) => a.id !== assetId);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cinema-assets-updated", { detail: updated }));
    return updated;
  } catch (err) {
    console.warn("[AssetStore] Could not delete local asset:", err);
    return getLocalAssets(userId);
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
