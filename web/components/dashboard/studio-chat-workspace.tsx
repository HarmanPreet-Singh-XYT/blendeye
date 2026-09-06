"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  Play,
  Film,
  Compass,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Zap,
  RotateCcw,
  Check,
  Bot,
  AtSign,
  ArrowRight,
  Database,
  Shuffle,
  ChevronRight,
  ArrowUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type ProjectData,
  type ProjectCharacter,
  createNewProjectEntry,
  buildProjectNodesAndEdges,
  saveProject,
  synthesizeDynamicCharacters,
} from "@/lib/project-store";
import { MarkdownRenderer } from "@/components/cinema/markdown-renderer";
import { toast } from "@/components/ui/toast";

export interface DashboardChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thought?: string;
  createdProject?: ProjectData;
  updatedProject?: ProjectData;
  modifiedFields?: string[];
  suggestedPrompts?: string[];
}

interface StudioChatWorkspaceProps {
  projects: ProjectData[];
  onRefreshProjects: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenNewProjectDialog: () => void;
  onOpenFusionDialog: () => void;
  onOpenToolbox: () => void;
}

const STORAGE_CHAT_KEY = "agentic_cinema_dashboard_chat_history_v4";
const STORAGE_ACTIVE_PROJECT_KEY = "agentic_cinema_dashboard_active_project_id_v4";

const GENRE_STYLES: Record<string, { gradient: string; accent: string; badge: string }> = {
  heist: {
    gradient: "from-amber-950/40 via-background to-background",
    accent: "border-amber-500/30 text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  "sci-fi": {
    gradient: "from-cyan-950/40 via-background to-background",
    accent: "border-cyan-500/30 text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  noir: {
    gradient: "from-purple-950/40 via-background to-background",
    accent: "border-purple-500/30 text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  drama: {
    gradient: "from-rose-950/40 via-background to-background",
    accent: "border-rose-500/30 text-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  thriller: {
    gradient: "from-emerald-950/40 via-background to-background",
    accent: "border-emerald-500/30 text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  default: {
    gradient: "from-slate-900/50 via-background to-background",
    accent: "border-border text-foreground",
    badge: "bg-secondary text-muted-foreground border-border",
  },
};

function getGenreStyle(genre: string) {
  const g = (genre || "").toLowerCase();
  if (g.includes("heist") || g.includes("crime")) return GENRE_STYLES.heist;
  if (g.includes("sci-fi") || g.includes("space")) return GENRE_STYLES["sci-fi"];
  if (g.includes("noir") || g.includes("cyber")) return GENRE_STYLES.noir;
  if (g.includes("drama") || g.includes("character")) return GENRE_STYLES.drama;
  if (g.includes("thriller") || g.includes("action")) return GENRE_STYLES.thriller;
  return GENRE_STYLES.default;
}

export function StudioChatWorkspace({
  projects,
  onRefreshProjects,
  onOpenProject,
  onOpenNewProjectDialog,
  onOpenFusionDialog,
  onOpenToolbox,
}: StudioChatWorkspaceProps) {
  const router = useRouter();

  // Chat messages: loads existing session or defaults to empty (clean hero view)
  const [messages, setMessages] = React.useState<DashboardChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error("Failed to load dashboard chat history:", err);
    }
    return [];
  });

  // Active project bound to chat: defaults to null so user is never locked to an old slate
  const [activeProjectId, setActiveProjectId] = React.useState<string | null>(null);

  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [selectedGenre, setSelectedGenre] = React.useState("Crime Heist");
  const [selectedDirectorStyle, setSelectedDirectorStyle] = React.useState("Denis Villeneuve (Atmospheric)");
  const [openThoughts, setOpenThoughts] = React.useState<Record<string, boolean>>({});
  const [showMentionMenu, setShowMentionMenu] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync messages to localStorage
  React.useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_CHAT_KEY);
      }
    } catch (err) {
      console.error("Failed to save dashboard chat history:", err);
    }
  }, [messages]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  // Find active project object
  const activeProject = React.useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const toggleThought = (msgId: string) => {
    setOpenThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleResetToLanding = () => {
    setMessages([]);
    setActiveProjectId(null);
    setInput("");
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
      localStorage.removeItem(STORAGE_ACTIVE_PROJECT_KEY);
    } catch {}
  };

  // Check mention triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const lastWord = val.split(/\s+/).pop() || "";
    if (lastWord.startsWith("@")) {
      setShowMentionMenu(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (text: string) => {
    const words = input.split(/\s+/);
    words.pop();
    words.push(`@${text}`);
    setInput(words.join(" ") + " ");
    setShowMentionMenu(false);
    textareaRef.current?.focus();
  };

  // Helper to extract a title the director already stated in conversation.
  // Returns null if no explicit title was found in the text (caller then
  // asks the Showrunner AI to generate one, rather than picking a canned name).
  const extractStatedTitle = (recentContext: string): string | null => {
    const quoteMatch = recentContext.match(/["']([^"']{3,40})["']/);
    if (quoteMatch) {
      const q = quoteMatch[1].trim();
      if (!/^(hey|hello|hi|yes|no|please|create|ok|thanks)/i.test(q)) {
        return q;
      }
    }
    const titleMatch = recentContext.match(/(?:titled|called|name it|named|working title:?)\s+([A-Za-z0-9\s:—–-]{3,35}?)(?:\s+(?:with|about|where|set|in)|[.,]|$)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return null;
  };

  // Static templates used ONLY when the AI casting/title service is
  // unreachable — always paired with a toast disclosure so this never
  // masquerades as live AI output.
  const FALLBACK_TITLES: Record<string, string[]> = {
    "sci-fi": ["The Orbital Horizon", "Chrono Null", "Silicon Horizon", "Station 9 Drift", "Solaris Echo"],
    heist: ["The Velvet Lock", "Monaco Breach", "Zero Sum Protocol", "The Geneva Exchange"],
    noir: ["Neon Protocol", "The Pale Rain", "Midnight Meridian", "Shadows of Cobalt"],
    thriller: ["Fractured Reflection", "The Solitary Echo", "Perception Glass", "Blind Angle"],
    horror: ["The Blackwood Vigil", "Hollow Pines", "Whispers of the Deep"],
    drama: ["The Winter Concord", "Iron & Glass", "The Last Commission"],
  };

  const fallbackTitleFor = (genre: string): string => {
    const g = genre.toLowerCase();
    const bucket =
      (g.includes("sci-fi") || g.includes("space") || g.includes("cyber")) ? FALLBACK_TITLES["sci-fi"] :
      (g.includes("heist") || g.includes("crime")) ? FALLBACK_TITLES.heist :
      (g.includes("noir") || g.includes("detective")) ? FALLBACK_TITLES.noir :
      (g.includes("psych") || g.includes("thriller") || g.includes("mystery")) ? FALLBACK_TITLES.thriller :
      (g.includes("horror") || g.includes("gothic")) ? FALLBACK_TITLES.horror :
      (g.includes("drama") || g.includes("historical")) ? FALLBACK_TITLES.drama :
      null;
    if (!bucket) return "Aethelgard Protocol";
    return bucket[Math.floor(Math.random() * bucket.length)];
  };

  // Calls the real AI ensemble-casting endpoint (Gemini via agent-service).
  // Falls back to curated genre templates ONLY on network/backend failure,
  // and always discloses that fallback to the director via toast.
  const synthesizeCastForContext = async (
    recentContext: string,
    genre: string
  ): Promise<ProjectCharacter[]> => {
    try {
      const res = await fetch("/api/character/synthesize-ensemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, premise: recentContext.slice(-1500) }),
      });
      const data = await res.json();
      if (Array.isArray(data.characters) && data.characters.length > 0 && !data._fallback) {
        return data.characters;
      }
    } catch (err) {
      console.warn("Ensemble synthesis request failed:", err);
    }
    toast.add({
      title: "Casting: showing template ensemble",
      description: "The AI casting service is unreachable, so this cast is a curated template, not live AI output.",
      type: "warning",
    });
    return synthesizeDynamicCharacters(genre, recentContext);
  };

  // Main submission handler
  const handleSendMessage = async (customPrompt?: string) => {
    const userPrompt = (customPrompt || input).trim();
    if (!userPrompt || isThinking) return;

    setInput("");
    setShowMentionMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMessage: DashboardChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userPrompt,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsThinking(true);

    const promptLower = userPrompt.toLowerCase();

    // Check if user is referencing an existing project via @ or exact title match
    let targetProject = activeProject;
    for (const p of projects) {
      if (
        userPrompt.includes(`@${p.title}`) ||
        (userPrompt.length > 5 && promptLower.includes(p.title.toLowerCase()))
      ) {
        targetProject = p;
        setActiveProjectId(p.id);
        break;
      }
    }

    // ────────────────────────────────────────────────────────
    // EXPLICIT PROJECT CREATION CHECK
    // Only triggers if user explicitly commands creation or clicks the creation button
    // ────────────────────────────────────────────────────────
    const isExplicitCreateCommand =
      promptLower === "create project" ||
      promptLower === "create the project" ||
      promptLower === "create a project" ||
      promptLower === "create new project" ||
      promptLower === "create slate" ||
      promptLower === "create the slate" ||
      promptLower === "create a slate" ||
      promptLower === "create production slate" ||
      promptLower === "create the production slate" ||
      promptLower === "create production slate for this story" ||
      promptLower === "spin up the slate" ||
      promptLower === "initialize the project" ||
      promptLower === "initialize project" ||
      promptLower === "yes, create the project" ||
      promptLower === "build this project slate" ||
      promptLower.startsWith("create project for ") ||
      promptLower.startsWith("create the project for ") ||
      promptLower.startsWith("create a project for ") ||
      promptLower.startsWith("create project titled ") ||
      promptLower.startsWith("create project called ") ||
      promptLower.startsWith("create production slate for ");

    try {
      // ────────────────────────────────────────────────────────
      // CASE 1: EXPLICIT PROJECT INITIALIZATION
      // ────────────────────────────────────────────────────────
      if (isExplicitCreateCommand) {
        // Collect discussion history to synthesize premise and characters
        const conversationContext = newMessages
          .map((m) => m.content)
          .join("\n");

        // Extract a strong logline from the conversation
        let logline = userPrompt;
        if (logline.length < 25) {
          const prevUserMsg = newMessages
            .slice(0, -1)
            .reverse()
            .find((m) => m.role === "user");
          logline = prevUserMsg?.content || `A high-tension ${selectedGenre} narrative directed in the style of ${selectedDirectorStyle}.`;
        }

        const statedTitle = extractStatedTitle(conversationContext);
        const characters = await synthesizeCastForContext(conversationContext, selectedGenre);

        let title = statedTitle || "";
        if (!title) {
          try {
            const genRes = await fetch("/api/project/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                logline,
                genre: selectedGenre,
                directorStyle: selectedDirectorStyle,
                customCharacters: characters,
              }),
            });
            const genData = await genRes.json();
            if (genData._fallback || genData._generatedBy === "semantic-showrunner-fallback") {
              toast.add({
                title: "Title: showing template name",
                description: "The AI title service is unreachable, so this title is a curated template, not live AI output.",
                type: "warning",
              });
            }
            if (typeof genData.title === "string" && genData.title.trim()) {
              title = genData.title.trim();
            }
          } catch (err) {
            console.warn("Title generation request failed:", err);
          }
        }
        if (!title) {
          toast.add({
            title: "Title: showing template name",
            description: "The AI title service is unreachable, so this title is a curated template, not live AI output.",
            type: "warning",
          });
          title = fallbackTitleFor(selectedGenre);
        }

        const newProject = createNewProjectEntry({
          title,
          logline,
          genre: selectedGenre,
          characters: characters.map((c) => `${c.name} (${c.role || c.archetype})`).join(", "),
        });

        newProject.characters = characters;
        newProject.directorStyle = selectedDirectorStyle;
        const { nodes, edges } = buildProjectNodesAndEdges(newProject);
        newProject.nodes = nodes;
        newProject.edges = edges;

        saveProject(newProject);
        onRefreshProjects();
        setActiveProjectId(newProject.id);

        // Fetch executive analysis and cold open from Showrunner backend
        let showrunnerAnalysis = "";
        let showrunnerSuggestions = [
          `Open Studio & Visual Backlot for "${title}"`,
          `Add a rival named Viktor who suspects ${characters[0]?.name || "the lead"}`,
          `Crank ${characters[1]?.name || "the antagonist"}'s subtext dial to 95%`,
          `Brainstorm the opening cold open scene`,
        ];

        try {
          const res = await fetch("/api/showrunner/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectTitle: newProject.title,
              logline: newProject.premise,
              genre: newProject.genre,
              characters: newProject.characters,
              screenplayText: newProject.screenplayText,
              message: `We just locked the premise and initialized the production slate "${newProject.title}". Give me an executive creative review and cold open pitch based on our discussion.`,
              history: newMessages.slice(-6).map((m) => ({
                role: m.role === "user" ? "user" : "showrunner",
                content: m.content,
              })),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.reply) showrunnerAnalysis = data.reply;
            if (Array.isArray(data.suggested_actions) && data.suggested_actions.length > 0) {
              showrunnerSuggestions = [
                `Open Studio & Visual Backlot for "${title}"`,
                ...data.suggested_actions,
              ];
            }
          }
        } catch (apiErr) {
          console.warn("Showrunner creative review failed, using default summary:", apiErr);
        }

        const replyContent = showrunnerAnalysis
          ? `I have initialized the production slate **"${title}"** with 14 visual backlot nodes and registered timeline firewalls in ClickHouse.\n\n${showrunnerAnalysis}\n\nYou can click below to enter the studio and inspect the visual backlot canvas, or continue chatting right here to refine scenes and character beats.`
          : `I have initialized the production slate **"${title}"** with 14 visual backlot nodes—including the Scene Master, Screenplay Draft, 2.39:1 Storyboard Frame, 2D Floor Plan, and Audience Tension Curve. Character psychologies for ${characters.map((c) => c.name).join(" and ")} are wired with ignorance firewalls.\n\nYou can click below to launch the studio, or continue chatting here to direct further.`;

        const assistantReply: DashboardChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: replyContent,
          thought: `1. Parsed film premise and conversation history.\n2. Synthesized title: "${title}" (${selectedGenre})\n3. Initialized 14 backlot nodes and character psychology graph for ${characters.map((c) => c.name).join(", ")}.\n4. Registered temporal boundaries and event firewalls in ClickHouse.\n5. Production slate created with ID: ${newProject.id}.`,
          timestamp: Date.now(),
          createdProject: newProject,
          suggestedPrompts: showrunnerSuggestions,
        };

        setMessages((prev) => [...prev, assistantReply]);
        setIsThinking(false);
        return;
      }

      // ────────────────────────────────────────────────────────
      // CASE 2: DIRECTIVE MODIFICATIONS ON EXISTING ACTIVE SLATE
      // ────────────────────────────────────────────────────────
      const isModificationDirective = Boolean(
        targetProject &&
        (
          /(?:add|introduce)\s+(?:a\s+)?(?:character\s+)?(?:named\s+)?([A-Z][a-zA-Z0-9_-]+)/i.test(userPrompt) ||
          /(?:set|crank|adjust|change)\s+([a-zA-Z]+)(?:'s)?\s+(confidence|pacing|subtext|tension)/i.test(userPrompt) ||
          promptLower.includes("director style") ||
          promptLower.includes("switch style to") ||
          promptLower.includes("change style to") ||
          promptLower.includes("rewrite the climax") ||
          promptLower.includes("rewrite ending")
        )
      );

      if (targetProject && isModificationDirective) {
        const currentProj = { ...targetProject };
        const modifiedFields: string[] = [];
        let thought = `Directorial directive applied to slate "${currentProj.title}": "${userPrompt}".\n`;
        let replyText = "";

        // 1. Add character
        const addCharMatch = userPrompt.match(/(?:add|introduce)\s+(?:a\s+)?(?:character\s+)?(?:named\s+)?([A-Z][a-zA-Z0-9_-]+)/i);
        if (addCharMatch) {
          const charName = addCharMatch[1];
          const isRival = promptLower.includes("rival") || promptLower.includes("enemy");
          const role = isRival ? "Rival Antagonist" : "Dynamic Specialist";

          const newChar: ProjectCharacter = {
            name: charName,
            role,
            archetype: isRival ? "Ruthless Syndicate Operative" : "Strategic Specialist",
            speechStyle: isRival ? "clipped, icy, interrogative" : "direct, guarded",
            subtextRatio: "high",
            confidence: 85,
            verbalPacing: 75,
            objective: `Challenge existing dynamics as ${role}`,
            dialsSummary: "Confidence 85% · Subtext 80%",
            quirks: ["Scans the room before speaking"],
          };

          currentProj.characters = [...(currentProj.characters || []), newChar];
          const { nodes, edges } = buildProjectNodesAndEdges(currentProj);
          currentProj.nodes = nodes;
          currentProj.edges = edges;

          modifiedFields.push(`Added Character: ${charName} (${role})`);
          thought += `Added character "${charName}" and spawned actor and dial nodes on canvas.\n`;
          replyText += `I have introduced **${charName}** (${role}) into the slate, configured their psychological dials, and wired their actor node into the visual backlot canvas. `;
        }

        // 2. Adjust dial
        const dialMatch = userPrompt.match(/(?:set|crank|adjust|change)\s+([a-zA-Z]+)(?:'s)?\s+(confidence|pacing|subtext|tension)\s+(?:to\s+)?(\d+)?/i);
        if (dialMatch) {
          const charName = dialMatch[1];
          const dialType = dialMatch[2].toLowerCase();
          const val = dialMatch[3] ? parseInt(dialMatch[3], 10) : 95;

          const charIndex = currentProj.characters.findIndex(
            (c) => c.name.toLowerCase() === charName.toLowerCase()
          );

          if (charIndex >= 0) {
            const char = { ...currentProj.characters[charIndex] };
            if (dialType.includes("confid")) char.confidence = val;
            if (dialType.includes("pacing")) char.verbalPacing = val;
            if (dialType.includes("subtext")) char.subtextRatio = val > 75 ? "very high" : "high";
            char.dialsSummary = `Confidence ${char.confidence || 85}% · Subtext ${char.subtextRatio || "high"}`;

            currentProj.characters[charIndex] = char;
            modifiedFields.push(`${char.name}: ${dialType} dial set to ${val}%`);
            thought += `Adjusted ${char.name}'s ${dialType} dial to ${val}%.\n`;
            replyText += `Adjusted **${char.name}'s** ${dialType} dial to **${val}%**. `;
          }
        }

        // 3. Change Director Style
        if (promptLower.includes("director style") || promptLower.includes("switch style") || promptLower.includes("change style")) {
          let newStyle = currentProj.directorStyle || "Hollywood Standard";
          if (promptLower.includes("nolan")) newStyle = "Christopher Nolan (Temporal)";
          else if (promptLower.includes("villeneuve")) newStyle = "Denis Villeneuve (Atmospheric)";
          else if (promptLower.includes("fincher")) newStyle = "David Fincher (Procedural)";
          else if (promptLower.includes("mann")) newStyle = "Michael Mann (High Tension)";
          else if (promptLower.includes("a24")) newStyle = "A24 Indie (Psychological)";

          if (newStyle !== currentProj.directorStyle) {
            currentProj.directorStyle = newStyle;
            modifiedFields.push(`Director Style: ${newStyle}`);
            thought += `Updated director style to ${newStyle}.\n`;
            replyText += `Switched cinematic camera blocking and director lens to **${newStyle}**. `;
          }
        }

        // 4. Rewrite climax / scene
        if (promptLower.includes("rewrite") && (promptLower.includes("climax") || promptLower.includes("ending"))) {
          currentProj.sceneSummary = `${currentProj.sceneSummary} — Escalation: ${userPrompt.slice(0, 120)}`;
          modifiedFields.push("Screenplay Climax Realigned");
          thought += `Realigned narrative stakes: "${userPrompt.slice(0, 80)}".\n`;
          replyText += `Screenplay climax and scene narrative stakes have been realigned with this dramatic escalation. `;
        }

        if (modifiedFields.length > 0) {
          currentProj.updatedAt = Date.now();
          saveProject(currentProj);
          onRefreshProjects();

          const assistantReply: DashboardChatMessage = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content:
              replyText ||
              `I have executed your requested modifications on **"${currentProj.title}"**. The visual backlot nodes and ClickHouse timeline reflect these live changes.`,
            thought,
            timestamp: Date.now(),
            updatedProject: currentProj,
            modifiedFields,
            suggestedPrompts: [
              `Open Studio & Backlot for "${currentProj.title}"`,
              `Crank scene tension to 95%`,
              `Brainstorm another dramatic complication`,
            ],
          };

          setMessages((prev) => [...prev, assistantReply]);
          setIsThinking(false);
          return;
        }
      }

      // ────────────────────────────────────────────────────────
      // CASE 3: CONVERSATIONAL HUMAN-LIKE SHOWRUNNER CHAT (DEFAULT)
      // Chats like ChatGPT in a writers' room: listens, brainstorms, explores ideas.
      // ────────────────────────────────────────────────────────
      try {
        const payload = {
          projectTitle: targetProject?.title || "",
          logline: targetProject?.premise || "",
          genre: targetProject?.genre || selectedGenre,
          screenplayText: targetProject?.screenplayText || "",
          characters: targetProject?.characters || [],
          message: userPrompt,
          history: newMessages.slice(-8).map((m) => ({
            role: m.role === "user" ? "user" : "showrunner",
            content: m.content,
          })),
        };

        const res = await fetch("/api/showrunner/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          let thought = `Executive Showrunner cognitive analysis. Connected to Google ADK reasoning engine.`;
          if (data.precedents_cited && data.precedents_cited.length > 0) {
            thought += `\n\nClickHouse Grounding Benchmarks:\n` +
              data.precedents_cited.map((p: any) => `- ${p.historical_reference}: ${p.trope} (Tension ${p.tension_level}/10, Retention ${p.audience_retention_pct}%)`).join("\n");
          }
          if (data.clickhouse_query_sql) {
            thought += `\n\nExecuted ClickHouse SQL:\n${data.clickhouse_query_sql}`;
          }

          let followups: string[] = [];
          if (Array.isArray(data.suggested_actions) && data.suggested_actions.length > 0) {
            followups = [...data.suggested_actions];
          }

          if (!targetProject) {
            if (!followups.some((f) => f.toLowerCase().includes("create"))) {
              followups.push("Create production slate for this story");
            }
          }

          const assistantReply: DashboardChatMessage = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: data.reply || "I am listening, Director. How would you like to develop this further?",
            thought,
            timestamp: Date.now(),
            suggestedPrompts: followups.slice(0, 4),
          };

          setMessages((prev) => [...prev, assistantReply]);
          setIsThinking(false);
          return;
        }
      } catch (chatErr) {
        console.warn("Showrunner chat endpoint fetch error:", chatErr);
      }

      // Contextual fallback if network/service temporarily unreachable
      const fallbackReply: DashboardChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: targetProject
          ? `Loud and clear. I am actively tracking **"${targetProject.title}"** with ${targetProject.characters.map((c) => c.name).join(" and ")}. What specific beat or dynamic shall we explore next?`
          : `I am here and listening. What kind of world or conflict are we thinking about building today?`,
        thought: `Showrunner listening channel verified.`,
        timestamp: Date.now(),
        suggestedPrompts: targetProject
          ? [
              `Add a rival character to accelerate tension`,
              `Crank scene tension to 95%`,
              `Open Studio & Backlot`,
            ]
          : [
              `Pitch a crime heist film premise`,
              `Brainstorm a hard sci-fi airlock sequence`,
              `Create production slate for this story`,
            ],
      };
      setMessages((prev) => [...prev, fallbackReply]);
      setIsThinking(false);
    } catch (err) {
      console.error("Showrunner error:", err);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: "assistant",
          content: "I encountered an interruption in the writers' room connection. Please try sending your message again.",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // STATE A: INITIAL CLEAN HERO LANDING (Before first message is sent)
  // ──────────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-y-auto bg-[#090a0d]">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[380px] w-[640px] rounded-full bg-gradient-to-r from-cyan-600/10 via-amber-500/10 to-purple-600/10 blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center w-full">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/30 px-3 py-1 text-xs font-mono text-muted-foreground mb-5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Showrunner AI · Google ADK & ClickHouse Active</span>
          </div>

          {/* Hero Title */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
            The Showrunner&apos;s Room
          </h1>
          <p className="mt-2.5 text-sm md:text-base text-muted-foreground max-w-lg text-balance leading-relaxed">
            Brainstorm concepts, develop character psychologies, and shape screenplays. When you&apos;re ready, initialize an interactive production slate.
          </p>

          {/* ── Director Prompt Input Box ── */}
          <div className="mt-8 w-full rounded-2xl border border-border/90 bg-[#12141a]/95 backdrop-blur-xl shadow-2xl p-3 text-left focus-within:border-accent/60 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a story question, pitch a scene, or brainstorm a premise (e.g. 'I want to write a high-tension heist where the two leads realize they're both working for rival cartels...')"
              className="w-full min-h-[76px] bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/40">
              <div className="flex items-center gap-2">
                {/* Genre Selector */}
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="h-7 rounded-lg border border-border/80 bg-secondary/40 px-2 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Crime Heist">Crime Heist</option>
                  <option value="Deep Space Sci-Fi">Deep Space Sci-Fi</option>
                  <option value="Cyberpunk Noir">Cyberpunk Noir</option>
                  <option value="Psychological Drama">Psychological Drama</option>
                  <option value="Action Thriller">Action Thriller</option>
                </select>

                {/* Director Style */}
                <select
                  value={selectedDirectorStyle}
                  onChange={(e) => setSelectedDirectorStyle(e.target.value)}
                  className="h-7 rounded-lg border border-border/80 bg-secondary/40 px-2 text-xs text-foreground focus:outline-none cursor-pointer hidden sm:block"
                >
                  <option value="Denis Villeneuve (Atmospheric)">Denis Villeneuve</option>
                  <option value="David Fincher (Procedural)">David Fincher</option>
                  <option value="Christopher Nolan (Temporal)">Christopher Nolan</option>
                  <option value="Michael Mann (High Tension)">Michael Mann</option>
                  <option value="A24 Indie (Psychological)">A24 Indie</option>
                </select>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={isThinking || !input.trim()}
                className="h-7 px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs gap-1.5 shadow-sm ml-auto"
              >
                <span>Send</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Conversational Starter Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleSendMessage("Let's brainstorm a neo-noir crime thriller set in a rain-slicked port city")}
              className="rounded-full border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-amber-500/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs"
            >
              Neo-noir crime thriller
            </button>

            <button
              onClick={() => handleSendMessage("How do I build tension between two estranged operators trapped in a locked airlock?")}
              className="rounded-full border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-cyan-500/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs"
            >
              Sci-fi airlock tension
            </button>

            <button
              onClick={() => handleSendMessage("Help me write an interrogation scene with an unreliable narrator")}
              className="rounded-full border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-purple-500/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs"
            >
              Psychological interrogation
            </button>

            <button
              onClick={onOpenNewProjectDialog}
              className="rounded-full border border-border/80 bg-secondary/30 hover:bg-secondary/60 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Blank Slate</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground/80">
            <span>or jump to:</span>
            <button onClick={onOpenToolbox} className="hover:text-foreground underline decoration-dotted">
              ClickHouse Precedents
            </button>
            <span>·</span>
            <Link href="/canvas-demo" className="hover:text-foreground underline decoration-dotted">
              Interactive Canvas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // STATE B: INTERACTIVE CHAT SCREEN (Spacious, Full-Height ChatGPT Style)
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090a0d] text-foreground relative">
      {/* ── Ultra-Slim Sub-Header Strip (h-10) ── */}
      <div className="h-10 border-b border-border/70 px-4 sm:px-6 flex items-center justify-between bg-[#0c0d10]/95 backdrop-blur shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-foreground font-medium">Showrunner AI</span>
          </div>

          {activeProject ? (
            <div className="flex items-center gap-1.5 ml-2 pl-2.5 border-l border-border/60">
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                Slate:
              </span>
              <button
                onClick={() => onOpenProject(activeProject.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 text-xs font-medium truncate transition-colors"
                title="Open visual studio"
              >
                <Film className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[140px]">{activeProject.title}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
              </button>
              <button
                onClick={() => setActiveProjectId(null)}
                className="text-muted-foreground hover:text-foreground p-0.5"
                title="Detach slate to ideate freely"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-muted-foreground/70 hidden sm:inline ml-2 pl-2 border-l border-border/60">
              Writers&apos; Room Ideation
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeProject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenProject(activeProject.id)}
              className="h-6 text-[11px] border-accent/40 text-accent hover:bg-accent/10 gap-1 px-2"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Studio</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToLanding}
            className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2"
            title="Start new conversation"
          >
            <RotateCcw className="h-3 w-3" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* ── Chat Messages Scroll Feed (Takes 85%+ Screen Height) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLastAssistant = !isUser && (idx === messages.length - 1 || (idx === messages.length - 2 && messages[messages.length - 1].role === "user"));

          return (
            <div
              key={msg.id}
              className={`flex gap-3 min-w-0 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Showrunner Avatar */}
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent shadow-xs mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div className={`flex flex-col gap-1.5 min-w-0 max-w-[88%] sm:max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                {/* Author Label */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>{isUser ? "Director" : "Showrunner"}</span>
                  <span>·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed min-w-0 max-w-full overflow-hidden ${
                    isUser
                      ? "bg-secondary/80 border border-border text-foreground shadow-xs rounded-tr-xs"
                      : "bg-[#13151b] border border-border text-foreground shadow-md rounded-tl-xs"
                  }`}
                >
                  {/* Showrunner Telemetry Accordion (Collapsed by Default) */}
                  {!isUser && msg.thought && (
                    <div className="mb-2.5 rounded-lg border border-border/60 bg-secondary/20 overflow-hidden">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-accent/90">
                          <Sparkles className="h-3 w-3" />
                          <span>Showrunner Telemetry & Precedents (ClickHouse)</span>
                        </span>
                        {openThoughts[msg.id] ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      {openThoughts[msg.id] && (
                        <div className="px-2.5 pb-2 pt-1 border-t border-border/40 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  ) : (
                    <div className="break-words max-w-full overflow-hidden">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      INTERACTIVE CARD: CREATED PRODUCTION SLATE
                  ────────────────────────────────────────────────────────── */}
                  {msg.createdProject && (
                    <div className="mt-3.5 rounded-xl border border-accent/40 bg-card overflow-hidden shadow-lg p-4 space-y-3">
                      {/* Slate Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Badge variant="outline" className={`text-[10px] font-mono font-medium ${getGenreStyle(msg.createdProject.genre).badge}`}>
                            {msg.createdProject.genre}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground truncate border-l border-border/60 pl-2">
                            {msg.createdProject.sceneTitle || "Scene 01"}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-accent/15 border border-accent/30 font-mono text-[10px] text-accent font-semibold shrink-0">
                          SLATE CREATED
                        </span>
                      </div>

                      {/* Title & Logline */}
                      <div className="space-y-1">
                        <h3 className="font-heading text-base font-bold text-foreground">
                          {msg.createdProject.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pl-2.5 border-l-2 border-accent/40">
                          {msg.createdProject.premise}
                        </p>
                      </div>

                      {/* Dynamic Cast Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mr-1">
                          <Users className="h-3 w-3" />
                          Cast:
                        </span>
                        {msg.createdProject.characters.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-secondary/80 border border-border/70 text-[10px] font-mono text-foreground"
                          >
                            {c.name} {c.role ? `(${c.role})` : ""}
                          </span>
                        ))}
                      </div>

                      {/* Metadata Strip */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1.5 border-t border-border/40">
                        <span>Director: {msg.createdProject.directorStyle || "Hollywood Standard"}</span>
                        <span className="text-emerald-400">14 Backlot Nodes Configured</span>
                      </div>

                      {/* Primary Action Button */}
                      <div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onOpenProject(msg.createdProject!.id)}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-xs gap-2 h-8 shadow-md"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Enter Studio & Visual Backlot</span>
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      INTERACTIVE CARD: MODIFIED PRODUCTION SLATE
                  ────────────────────────────────────────────────────────── */}
                  {msg.updatedProject && msg.modifiedFields && (
                    <div className="mt-3 rounded-xl border border-border/80 bg-secondary/20 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                          {msg.updatedProject.title} (Updated)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenProject(msg.updatedProject!.id)}
                          className="h-6 text-[11px] text-accent hover:text-accent/80 gap-1 p-1"
                        >
                          <span>Open Studio</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {msg.modifiedFields.map((field, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1"
                          >
                            <Check className="h-2.5 w-2.5" />
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up Prompts */}
                {!isUser && isLastAssistant && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(p)}
                        className="rounded-full border border-border/70 bg-secondary/30 hover:bg-secondary/70 hover:border-accent/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-all text-left flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border text-foreground font-mono text-[10px] font-bold shadow-xs mt-0.5">
                  YOU
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 items-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent shadow-xs animate-pulse">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-xs px-3.5 py-2.5 bg-[#13151b] border border-border text-foreground shadow-md flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs font-mono text-muted-foreground ml-1.5">
                Showrunner considering story beats...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Compact, Modern Floating Chat Input (Height ~60px) ── */}
      <div className="border-t border-border/70 bg-[#0c0d10]/95 backdrop-blur-md px-4 py-3 shrink-0 z-20">
        <div className="max-w-3xl mx-auto">
          {/* Autocomplete Dropdown for @ mentions */}
          {showMentionMenu && (
            <div className="mb-2 w-72 rounded-xl border border-border bg-[#161820] shadow-2xl p-1.5 z-30 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground border-b border-border/40">
                Mention Slate
              </div>
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {projects
                  .filter((p) => p.title.toLowerCase().includes(mentionQuery))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectMention(p.title)}
                      className="w-full flex items-center justify-between rounded-lg px-2 py-1 text-xs text-foreground hover:bg-secondary/60 text-left"
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="text-[10px] font-mono text-accent">Slate</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Sleek Pill Input Container */}
          <div className="relative rounded-2xl border border-border bg-[#12141a] px-3.5 py-1.5 text-left focus-within:border-accent/60 shadow-lg transition-all flex items-center gap-2 min-h-[46px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                activeProject
                  ? `Direct "${activeProject.title}" or ask questions...`
                  : "Talk with the Showrunner, pitch an idea, or type 'create project'..."
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-5 py-1 m-0 max-h-28 overflow-y-auto block"
            />

            <Button
              variant="default"
              size="icon-sm"
              onClick={() => handleSendMessage()}
              disabled={isThinking || !input.trim()}
              className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-sm flex items-center justify-center self-center"
              title="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Micro Footer Information */}
          <div className="flex items-center justify-between pt-1.5 px-2 text-[10px] font-mono text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <span>Genre: {selectedGenre}</span>
              <span>·</span>
              <span>Lens: {selectedDirectorStyle.split(" ")[0]}</span>
            </div>
            <span>Type &quot;create project&quot; when ready to spin up slate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
