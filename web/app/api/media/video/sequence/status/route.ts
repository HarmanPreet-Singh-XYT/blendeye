import { NextRequest, NextResponse } from "next/server";
import { getVideoSequenceStatus } from "@/lib/agent-service";
import { persistLocalMediaToBucket } from "@/lib/media-storage-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("job_id");

  if (!jobId) {
    return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
  }

  try {
    const result = await getVideoSequenceStatus(jobId);
    if (result && Array.isArray(result.shots)) {
      for (const shot of result.shots) {
        if (shot.status === "completed" && shot.video_url && !shot.video_url.startsWith("http")) {
          const { publicUrl } = await persistLocalMediaToBucket(shot.video_url, {
            name: `Veo Sequence ${jobId.slice(0, 8)} Shot ${shot.shot_number}`,
            category: "video",
            targetFolder: "videos",
            mimeType: "video/mp4",
            tags: ["veo-sequence", "shot-chain", "ai-generated"],
            metadata: { jobId, shotNumber: shot.shot_number },
          });
          if (publicUrl) {
            shot.video_url = publicUrl;
          }
        }
      }
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", error: message }, { status: 502 });
  }
}
