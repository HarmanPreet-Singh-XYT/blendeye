import { toast } from "@/components/ui/toast";

/**
 * API routes proxy to the Python agent-service and degrade to hardcoded
 * demo content (marked `_fallback: true`) instead of erroring when that
 * backend is unreachable, so the UI stays usable during a live demo.
 * Call this after parsing any such response so the director isn't misled
 * into thinking mock content is a live Gemini/Veo/ClickHouse result.
 */
export function notifyIfFallback(data: unknown, featureLabel: string): boolean {
  if (data && typeof data === "object" && (data as Record<string, unknown>)._fallback) {
    toast.add({
      title: `${featureLabel}: showing offline demo content`,
      description: "The agent-service backend is unreachable, so this is placeholder output, not a live AI result.",
      type: "warning",
    });
    return true;
  }
  return false;
}
