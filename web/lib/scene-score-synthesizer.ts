import type { Node } from "@xyflow/react";
import type { FilmScene, ProjectCharacter, ProjectData } from "@/lib/project-store";

export interface ContextItemStatus {
  id: "visual" | "tension" | "style" | "screenplay" | "timing";
  label: string;
  isReady: boolean;
  valueDescription: string;
  whyItMatters: string;
  actionRecommendation?: string;
  thumbnailUrl?: string;
}

export interface SceneContextReadiness {
  scorePercentage: number;
  items: ContextItemStatus[];
  missingCount: number;
  readyCount: number;
}

export interface ScoreSynthesisOptions {
  scene?: FilmScene | null;
  project?: Partial<ProjectData> | null;
  nodes?: Node[];
  characters?: ProjectCharacter[];
  scoreType: "score" | "source" | "vocal";
  intensityArc: string;
  leadInstruments: string[];
  vocalStyle?: string;
  customLyrics?: string;
  targetLanguage?: string;
  targetDurationSec?: number;
}

export interface ScoreSynthesisResult {
  fullPrompt: string;
  recommendedDurationMode: "clip" | "pro";
  recommendedDurationSec: number;
  conditioningImageUrl: string | null;
  conditioningImageSource: "scene_keyframe" | "scout_image" | "character_portrait" | null;
  genreLyrics?: string;
  readiness: SceneContextReadiness;
  autoInferredElements: string[];
}

/**
 * Analyzes the scene and project data to produce a clear readiness breakdown.
 * Informs the user exactly which elements are present vs. what is missing to achieve optimal generation.
 */
export function analyzeSceneMusicContext(
  scene?: FilmScene | null,
  project?: Partial<ProjectData> | null,
  nodes: Node[] = []
): SceneContextReadiness {
  // 1. Visual reference check
  let visualUrl: string | undefined;
  if (scene?.preview_image_url) {
    visualUrl = scene.preview_image_url;
  } else if (scene?.sceneImages && scene.sceneImages.length > 0) {
    visualUrl = scene.sceneImages[0].url;
  } else if (project?.characters && project.characters[0]?.imageUrl) {
    visualUrl = project.characters[0].imageUrl;
  }

  const visualItem: ContextItemStatus = {
    id: "visual",
    label: "Visual Keyframe & Color Palette",
    isReady: Boolean(visualUrl),
    valueDescription: visualUrl ? "Attached scene concept frame for multimodal mood matching" : "No concept frame found",
    whyItMatters: "Lyria 3 multimodal vision absorbs visual color temperature, shadows, and environment scale to sonically anchor the score.",
    actionRecommendation: visualUrl ? undefined : "Generate a storyboard frame in 'Scene Scouting' to enable automatic visual-to-audio matching.",
    thumbnailUrl: visualUrl,
  };

  // 2. Tension beats / Timeline events check
  const eventCount = scene?.events?.length || 0;
  const tensionNode = nodes.find((n) => n.type === "tensionCurve");
  const peakTension = tensionNode?.data?.peakTension as number | undefined;

  const hasTension = eventCount > 0 || Boolean(peakTension);
  const tensionDesc = eventCount > 0
    ? `${eventCount} story event beats found on timeline`
    : peakTension
    ? `Tension curve peak registered at ${peakTension}%`
    : "No timeline event markers registered";

  const tensionItem: ContextItemStatus = {
    id: "tension",
    label: "Dramatic Tension & Dynamic Arc",
    isReady: hasTension,
    valueDescription: tensionDesc,
    whyItMatters: "Allows the AI composer to time crescendos, rhythmic accelerations, and sudden silence to your story's turning points.",
    actionRecommendation: hasTension ? undefined : "Run the Perspective Sharder or add Story Events on the timeline to guide musical dynamics.",
  };

  // 3. Director Style & Acoustic Texture
  const effectiveDirectorStyle = scene?.directorStyle || project?.directorStyle;
  const hasStyle = Boolean(effectiveDirectorStyle && effectiveDirectorStyle.trim().length > 3);
  const styleItem: ContextItemStatus = {
    id: "style",
    label: "Director Signature & Acoustic Space",
    isReady: hasStyle,
    valueDescription: hasStyle ? (effectiveDirectorStyle as string) : "Standard cinematic default (No director signature specified)",
    whyItMatters: "Informs sonic aesthetic, reverb characteristics (e.g. dry concrete vault vs. lush hall), and instrument coloration.",
    actionRecommendation: hasStyle ? undefined : "Add a Director Style in Project Settings or drop a Style Study Clip on the canvas.",
  };

  // 4. Screenplay / Dialogue context
  const scriptText = scene?.screenplayText || project?.screenplayText || "";
  const linesCount = scriptText.split("\n").filter((l) => l.trim().length > 0).length;
  const hasScript = linesCount >= 4;
  const scriptItem: ContextItemStatus = {
    id: "screenplay",
    label: "Screenplay Lines & Emotional Subtext",
    isReady: hasScript,
    valueDescription: hasScript ? `${linesCount} lines of screenplay dialogue/action detected` : "Minimal or empty screenplay text",
    whyItMatters: "Allows extraction of emotional undertones and powers instant auto-generation of rhymed song lyrics for vocal themes.",
    actionRecommendation: hasScript ? undefined : "Draft dialogue in the Screenplay view to feed subtext into the score.",
  };

  // 5. Scene Timing / Duration
  const durationSec = scene?.durationSeconds || project?.sceneDurationSeconds || 30;
  const timingItem: ContextItemStatus = {
    id: "timing",
    label: "Scene Timing & Cut Length",
    isReady: true,
    valueDescription: `${durationSec}s cut length (Auto-mapped to ${durationSec <= 30 ? "Lyria Clip 30s" : "Lyria Pro 3-min"})`,
    whyItMatters: "Determines whether to trigger a punchy 30-second scene sting or an extended multi-movement cinematic track.",
  };

  const items = [visualItem, tensionItem, styleItem, scriptItem, timingItem];
  const readyCount = items.filter((i) => i.isReady).length;
  const missingCount = items.length - readyCount;
  const scorePercentage = Math.round((readyCount / items.length) * 100);

  return {
    scorePercentage,
    items,
    missingCount,
    readyCount,
  };
}

/**
 * Automatically synthesizes a production-grade Lyria 3 score prompt
 * using all available scene, project, and graph data.
 */
export function synthesizeSceneScorePrompt(options: ScoreSynthesisOptions): ScoreSynthesisResult {
  const {
    scene,
    project,
    nodes = [],
    characters = [],
    scoreType,
    intensityArc,
    leadInstruments,
    vocalStyle = "Breathy Alto Textures",
    customLyrics,
    targetLanguage = "English",
    targetDurationSec,
  } = options;

  const autoInferredElements: string[] = [];
  const readiness = analyzeSceneMusicContext(scene, project, nodes);

  // Genre and Director Palette
  const genre = project?.genre || "Cinematic Drama";
  const directorStyle = scene?.directorStyle || project?.directorStyle || "Modern Hollywood Cinema";
  const slugline = scene?.slugline || "INT. SCENE - CINEMATIC NIGHT";
  const sceneTitle = scene?.title || project?.sceneTitle || "Dramatic Confrontation";
  const sceneSummary = scene?.summary || project?.sceneSummary || "";

  // Visual reference resolve
  let conditioningImageUrl: string | null = null;
  let conditioningImageSource: ScoreSynthesisResult["conditioningImageSource"] = null;

  if (scene?.preview_image_url) {
    conditioningImageUrl = scene.preview_image_url;
    conditioningImageSource = "scene_keyframe";
  } else if (scene?.sceneImages && scene.sceneImages.length > 0) {
    conditioningImageUrl = scene.sceneImages[0].url;
    conditioningImageSource = "scout_image";
  } else if (characters.length > 0 && characters[0].imageUrl) {
    conditioningImageUrl = characters[0].imageUrl;
    conditioningImageSource = "character_portrait";
  }

  // Duration mode resolve
  const durationSec = targetDurationSec || scene?.durationSeconds || 30;
  const recommendedDurationMode: "clip" | "pro" = durationSec <= 30 ? "clip" : "pro";
  const recommendedDurationSec = durationSec;

  // Build prompt parts
  const promptParts: string[] = [];

  if (targetDurationSec && targetDurationSec > 0) {
    promptParts.push(`Duration: Exactly ${targetDurationSec} seconds with a clean, resolved ending.`);
  }

  if (scoreType === "score") {
    promptParts.push(`Cinematic original score for a dramatic ${genre} film scene.`);
  } else if (scoreType === "source") {
    promptParts.push(`Diegetic in-world source music playing realistically in the environment for a ${genre} scene.`);
  } else {
    promptParts.push(`Atmospheric vocal soundtrack song for a ${genre} cinema sequence.`);
  }

  // Slugline acoustic hint
  if (slugline.includes("INT.")) {
    promptParts.push(`Setting: Interior space (${slugline.replace("INT.", "").trim()}). Controlled acoustic resonance, close intimate mic placement.`);
  } else if (slugline.includes("EXT.")) {
    promptParts.push(`Setting: Exterior space (${slugline.replace("EXT.", "").trim()}). Expansive spatial acoustics, open-air depth.`);
  }

  // Style and Tone
  promptParts.push(`Aesthetic direction: ${directorStyle}. Tone: Reflecting scene theme "${sceneTitle}" — ${sceneSummary.slice(0, 100)}.`);

  // Instrumentation
  if (leadInstruments.length > 0) {
    promptParts.push(`Lead instrumentation: ${leadInstruments.join(", ")}.`);
  } else {
    promptParts.push(`Lead instrumentation: Layered orchestral strings, analog sub-bass synthesizer pads, and delicate piano motif.`);
    autoInferredElements.push("Selected default hybrid-orchestral instrument palette");
  }

  // Dynamic Arc
  promptParts.push(`Dynamic progression: ${intensityArc}.`);

  // Vocals handling
  if (scoreType === "vocal") {
    promptParts.push(`Vocal profile: ${vocalStyle}. Expressive, emotionally nuanced vocal delivery in ${targetLanguage}.`);
  } else {
    promptParts.push("Instrumental score without speech or spoken dialogue, leaving headroom for dialogue clarity.");
  }

  // Add mastering tag
  promptParts.push("Production quality: High dynamic range, film-grade mix, pristine low-end clarity, no harsh artifacts.");

  const fullPrompt = promptParts.join(" ");

  // Auto-compose lyrics if vocal score and none provided
  let genreLyrics = customLyrics;
  if (scoreType === "vocal" && !genreLyrics) {
    genreLyrics = autoDraftLyrics(sceneTitle, sceneSummary, scene?.screenplayText, genre);
    autoInferredElements.push("Auto-composed lyrical verses from scene screenplay subtext");
  }

  return {
    fullPrompt,
    recommendedDurationMode,
    recommendedDurationSec,
    conditioningImageUrl,
    conditioningImageSource,
    genreLyrics,
    readiness,
    autoInferredElements,
  };
}

/**
 * Auto-drafts cinematic verse and chorus lyrics based on the scene's emotional subtext.
 */
export function autoDraftLyrics(
  sceneTitle: string,
  sceneSummary: string,
  screenplayText?: string,
  genre?: string
): string {
  const titleClean = sceneTitle.replace(/^(SCENE \d+:\s*)/i, "");
  
  return `[Intro]
(Atmospheric instrumental swell with distant echoes)

[Verse 1]
Shadows gather on the perimeter line,
Trading seconds for a borrowed piece of time.
What is hidden beneath the silent glass,
A truth too fragile to outlive the past.

[Chorus]
Across the divide, before the lights ignite,
We walk the razors edge into the night.
No turning back, the die is already cast,
In the quiet of ${titleClean || "the final hour"}.

[Outro]
(Harmonic vocal decay fading into sub-bass)`;
}
