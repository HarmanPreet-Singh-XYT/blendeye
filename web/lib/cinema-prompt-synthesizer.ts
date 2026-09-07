import type { Node } from "@xyflow/react";
import type { ProjectCharacter } from "@/lib/project-store";

export interface NodeContribution {
  id: string;
  type: string;
  label: string;
  summary: string;
  badgeColor: string;
}

export interface SynthesisOptions {
  nodes?: Node[];
  characters?: ProjectCharacter[];
  sceneTitle: string;
  sceneSummary?: string;
  screenplayText?: string;
  genre?: string;
  focusCharacterName?: string | null;
  cameraMotion?: string;
  stylePreset?: string;
  imagePreference?: "face" | "body" | "auto";
}

export interface SynthesisResult {
  fullPrompt: string;
  summary: string;
  conditioningImageUrl: string | null;
  conditioningImageType: "face" | "body" | "scene" | null;
  activeCharacter: ProjectCharacter | null;
  contributions: NodeContribution[];
}

/**
 * Extract a concise dialogue or action beat from screenplay text
 */
function extractScreenplayBeat(screenplayText?: string, targetCharacter?: string): string {
  if (!screenplayText) return "";
  const lines = screenplayText.split("\n").map((l) => l.trim()).filter(Boolean);
  
  if (targetCharacter) {
    const targetUpper = targetCharacter.toUpperCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === targetUpper && lines[i + 1] && !lines[i + 1].startsWith("(")) {
        return `"${lines[i + 1]}"`;
      }
    }
  }

  // Look for first strong action line or dialogue
  for (const line of lines) {
    if (
      !line.startsWith("INT.") &&
      !line.startsWith("EXT.") &&
      line !== line.toUpperCase() &&
      line.length > 20 &&
      line.length < 160
    ) {
      return line;
    }
  }

  return "";
}

/**
 * Intelligently synthesize a comprehensive cinematic prompt and image conditioning
 * by aggregating data across all Canvas Nodes and Character profiles.
 */
export function synthesizeCinemaPrompt(options: SynthesisOptions): SynthesisResult {
  const {
    nodes = [],
    characters = [],
    sceneTitle,
    sceneSummary = "",
    screenplayText = "",
    genre = "Cinema",
    focusCharacterName,
    cameraMotion = "Slow Cinematic Dolly In",
    stylePreset = "35mm Anamorphic Film, 2.39:1 Scope",
    imagePreference = "auto",
  } = options;

  const contributions: NodeContribution[] = [];

  // 1. Scene Master Node Context
  const sceneNode = nodes.find((n) => n.type === "scene");
  const slugline = (sceneNode?.data?.slugline as string) || "INT. PRODUCTION - CINEMATIC LIGHT";
  const sceneStakes = (sceneNode?.data?.stakes as string) || sceneSummary;
  
  contributions.push({
    id: sceneNode?.id || "node-scene-master",
    type: "scene",
    label: "Scene Master",
    summary: `${slugline} · ${sceneTitle}`,
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  });

  // 2. Style Reference Clip Node Context (Lighting, Palette, Pacing)
  const clipNode = nodes.find((n) => n.type === "clip");
  const lightingStudy = (clipNode?.data?.lightingStyle as string) || "High-contrast cinematic chiaroscuro, volumetric rim lighting";
  const colorPalette = (clipNode?.data?.palette as string[]) || ["#0b132b", "#1c2541", "#3a506b"];
  const pacingStyle = (clipNode?.data?.pacing as string) || "Taut cinematic slow-burn";

  if (clipNode) {
    contributions.push({
      id: clipNode.id,
      type: "clip",
      label: "Style Study Clip",
      summary: `${lightingStudy.slice(0, 45)}...`,
      badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    });
  }

  // 3. Storyboard Node Context
  const storyboardNode = nodes.find((n) => n.type === "storyboard");
  const storyboardFraming = (storyboardNode?.data?.shotType as string) || "2.39:1 Anamorphic Scope";
  const storyboardPrompt = (storyboardNode?.data?.prompt as string) || "";
  if (storyboardNode) {
    contributions.push({
      id: storyboardNode.id,
      type: "storyboard",
      label: "Storyboard Framing",
      summary: storyboardFraming,
      badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    });
  }

  // 4. Tension Curve Node Context
  const tensionNode = nodes.find((n) => n.type === "tensionCurve");
  const peakTension = tensionNode?.data?.peakTension as number | undefined;
  if (tensionNode && peakTension) {
    contributions.push({
      id: tensionNode.id,
      type: "tensionCurve",
      label: "Tension Curve",
      summary: `Peak Tension: ${peakTension}%`,
      badgeColor: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    });
  }

  // 5. Chemistry Node Context
  const chemistryNode = nodes.find((n) => n.type === "chemistry");
  const chemistryScenario = chemistryNode?.data?.scenario as string | undefined;
  if (chemistryNode && chemistryScenario) {
    contributions.push({
      id: chemistryNode.id,
      type: "chemistry",
      label: "Chemistry Bench",
      summary: chemistryScenario.slice(0, 45),
      badgeColor: "border-pink-500/40 bg-pink-500/10 text-pink-300",
    });
  }

  // 6. Screenplay Draft Node Context
  const scriptNode = nodes.find((n) => n.type === "script");
  const scriptBeat = extractScreenplayBeat(screenplayText, focusCharacterName || undefined);
  if (scriptBeat) {
    contributions.push({
      id: scriptNode?.id || "node-script-beat",
      type: "script",
      label: "Screenplay Beat",
      summary: scriptBeat.slice(0, 50),
      badgeColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    });
  }

  // 7. Character Dossier & Image Conditioning
  const activeCharacter = focusCharacterName
    ? characters.find((c) => c.name.toLowerCase() === focusCharacterName.toLowerCase()) || null
    : null;

  let conditioningImageUrl: string | null = null;
  let conditioningImageType: "face" | "body" | "scene" | null = null;

  if (activeCharacter) {
    if (imagePreference === "body" && activeCharacter.fullBodyImageUrl) {
      conditioningImageUrl = activeCharacter.fullBodyImageUrl;
      conditioningImageType = "body";
    } else if (imagePreference === "face" && activeCharacter.imageUrl) {
      conditioningImageUrl = activeCharacter.imageUrl;
      conditioningImageType = "face";
    } else if (activeCharacter.imageUrl) {
      conditioningImageUrl = activeCharacter.imageUrl;
      conditioningImageType = "face";
    } else if (activeCharacter.fullBodyImageUrl) {
      conditioningImageUrl = activeCharacter.fullBodyImageUrl;
      conditioningImageType = "body";
    }

    // Add character node contribution
    contributions.push({
      id: `node-core-${activeCharacter.name.toLowerCase()}`,
      type: "characterCore",
      label: `Cast: ${activeCharacter.name}`,
      summary: `${activeCharacter.actorComp ? `Comp: ${activeCharacter.actorComp} · ` : ""}${activeCharacter.role || activeCharacter.archetype}`,
      badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    });

    // Check for actor comp or quirks node
    const quirkNode = nodes.find((n) => n.id === `node-quirks-${activeCharacter.name.toLowerCase()}`);
    if (quirkNode) {
      contributions.push({
        id: quirkNode.id,
        type: "quirks",
        label: `${activeCharacter.name} Quirks`,
        summary: ((quirkNode.data?.tics as string[]) || []).join(", ").slice(0, 45) || "Micro-behaviors",
        badgeColor: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
      });
    }
  } else if (characters.length > 0) {
    // Master scene includes all main characters
    characters.slice(0, 3).forEach((c) => {
      contributions.push({
        id: `node-core-${c.name.toLowerCase()}`,
        type: "characterCore",
        label: `Ensemble: ${c.name}`,
        summary: c.actorComp ? `Like ${c.actorComp}` : c.archetype,
        badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
      });
    });
  }

  // BUILD THE MASTER PROMPT
  let promptBody = "";

  if (activeCharacter) {
    // ------------------- CHARACTER-FOCUSED TAKE -------------------
    const likenessComp = activeCharacter.actorComp
      ? `facial likeness and bone structure strongly echoing ${activeCharacter.actorComp}`
      : "";
    const wardrobeDetail = activeCharacter.wardrobe
      ? `wearing ${activeCharacter.wardrobe}`
      : "in costume consistent with their role";
    const visualDesc = activeCharacter.visualDescription
      ? activeCharacter.visualDescription.trim()
      : `${activeCharacter.archetype}, intense and dramatically lit facial presence`;
    const tics = activeCharacter.quirks && activeCharacter.quirks.length > 0
      ? `Distinctive physical mannerisms: ${activeCharacter.quirks.slice(0, 2).join("; ")}.`
      : "";
    const objective = activeCharacter.objective
      ? `Their expression and body language should read as: ${activeCharacter.objective}.`
      : "";

    promptBody = [
      `Cinematic 16:9 film still, ${slugline}.`,
      `Single subject in frame: ${activeCharacter.name}${likenessComp ? ` (${likenessComp})` : ""}, ${wardrobeDetail}.`,
      visualDesc,
      tics,
      objective,
      scriptBeat ? `Captured mid-beat: ${scriptBeat}.` : "",
      `Lighting: ${lightingStudy}. Color grade: ${colorPalette.slice(0, 3).join(", ")}.`,
      `Shot: ${storyboardFraming}, ${cameraMotion}.`,
      `Style: ${stylePreset}, shallow depth of field, photoreal skin and fabric detail, no text or watermarks.`,
    ].filter(Boolean).join(" ");
  } else {
    // ------------------- MASTER ENSEMBLE SCENE TAKE -------------------
    const castDescriptions = characters.slice(0, 2).map((c) => {
      const likeness = c.actorComp ? ` (likeness resembling ${c.actorComp})` : "";
      const clothes = c.wardrobe ? `, in ${c.wardrobe}` : "";
      return `${c.name}${likeness}${clothes}`;
    }).join(" and ");

    const conflict = chemistryScenario || sceneStakes || "high tension standoff";

    promptBody = [
      `Master cinematic 16:9 widescreen film still, ${slugline}.`,
      `${sceneTitle}, a ${genre} scene.`,
      castDescriptions ? `In frame: ${castDescriptions}, positioned in physical confrontation with each other.` : "",
      `Central conflict driving the moment: ${conflict}.`,
      scriptBeat ? `Action beat being depicted: ${scriptBeat}.` : "",
      storyboardPrompt ? `Framing direction: ${storyboardPrompt}.` : "",
      `Lighting: ${lightingStudy}. Pacing/mood: ${pacingStyle}. Color grade: ${colorPalette.slice(0, 4).join(", ")}.`,
      peakTension ? `Dramatic intensity: ${peakTension}/100, reflected in blocking and expressions.` : "",
      `Shot: ${storyboardFraming}, ${cameraMotion}.`,
      `Style: ${stylePreset}, photoreal depth, volumetric atmosphere, no text or watermarks.`,
    ].filter(Boolean).join(" ");
  }

  const cleanPrompt = promptBody.replace(/\s+/g, " ").trim();

  return {
    fullPrompt: cleanPrompt,
    summary: activeCharacter
      ? `Character take: ${activeCharacter.name} (${activeCharacter.actorComp || activeCharacter.archetype})`
      : `Master Scene Take: ${slugline} (${characters.length} characters in collision)`,
    conditioningImageUrl,
    conditioningImageType,
    activeCharacter,
    contributions,
  };
}
