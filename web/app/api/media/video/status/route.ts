import { NextRequest, NextResponse } from "next/server";
import { getVideoStatus } from "@/lib/agent-service";
import { persistLocalMediaToBucket } from "@/lib/media-storage-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operationName = searchParams.get("operation_name");

  if (!operationName) {
    return NextResponse.json({ error: "Missing operation_name" }, { status: 400 });
  }

  try {
    const result = await getVideoStatus(operationName);
    if (result && result.status === "completed" && result.video_url) {
      const { publicUrl } = await persistLocalMediaToBucket(result.video_url, {
        name: `Veo Render: ${operationName.split("/").pop() || "Take"}`,
        category: "video",
        targetFolder: "videos",
        mimeType: "video/mp4",
        tags: ["veo-3.1", "video-take", "ai-generated"],
        metadata: {
          operationName,
        },
      });
      if (publicUrl) {
        result.video_url = publicUrl;
      }
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: "error",
        error: message,
        video_url: null,
      },
      { status: 502 }
    );
  }
}
