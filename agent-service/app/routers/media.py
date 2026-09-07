import base64
import io
import logging
import uuid
import wave
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from google import genai
from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["media"])

# Character voice mappings for cinematic multi-speaker reads
VOICE_MAP = {
    "MARCUS": "Fenrir",
    "ELENA": "Aoede",
    "COLONEL": "Charon",
    "DR. ARLO": "Puck",
    "NARRATOR": "Zephyr",
    "DEFAULT": "Puck",
}


def pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 24000, channels: int = 1, sampwidth: int = 2) -> bytes:
    """Wrap raw 16-bit linear PCM audio into a standard WAV container."""
    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sampwidth)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_bytes)
    return wav_io.getvalue()


class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., description="Cinematic visual concept or storyboard prompt")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio (16:9, 1:1, etc.)")


class GenerateImageResponse(BaseModel):
    image_url: str
    prompt: str
    model: str


class GenerateTTSRequest(BaseModel):
    text: str = Field(..., description="Dialogue line or direction to speak")
    speaker: str | None = Field(default=None, description="Character name to assign voice timbre")
    voice_name: str | None = Field(default=None, description="Direct voice override (Aoede, Fenrir, Puck, Zephyr, Charon, Kore)")
    delivery_style: str | None = Field(default=None, description="Delivery style / tone instruction")
    speed: float | None = Field(default=1.0, description="Pacing multiplier (0.8 - 1.3)")
    pitch_fine: float | None = Field(default=0.0, description="Pitch modifier (-6 to +6)")
    formant_shift: float | None = Field(default=0.0, description="Formant shift / chest resonance (-6 to +6)")
    reverb_room: str | None = Field(default=None, description="Acoustic environment space")
    reverb_send: float | None = Field(default=0.0, description="Reverb wet send percentage (0 - 100)")


class GenerateTTSResponse(BaseModel):
    audio_url: str
    speaker: str
    voice_name: str
    duration_estimate_sec: float
    dsp_applied: dict[str, Any] | None = None


@router.post("/image", response_model=GenerateImageResponse)
async def generate_image(req: GenerateImageRequest):
    """Generate a cinematic storyboard or location keyframe using Gemini / Imagen 3 models."""
    settings = get_settings()
    api_key = settings.google_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    client = genai.Client(api_key=api_key)

    cinematic_prompt = (
        f"{req.prompt.strip().rstrip('.')}. "
        f"Aspect ratio {req.aspect_ratio}, photoreal cinematography, high production value, "
        f"sharp focus on the main subject, no text or watermarks, no distorted anatomy."
    )

    models_to_try = [
        "models/gemini-3.1-flash-image",
        "models/gemini-3-pro-image",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=cinematic_prompt,
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None and part.inline_data.data:
                    b64_data = base64.b64encode(part.inline_data.data).decode("utf-8")
                    mime = part.inline_data.mime_type or "image/png"
                    data_uri = f"data:{mime};base64,{b64_data}"
                    return GenerateImageResponse(
                        image_url=data_uri,
                        prompt=req.prompt,
                        model=model_name,
                    )
        except Exception as e:  # noqa: BLE001
            last_error = str(e)
            continue

    raise HTTPException(status_code=502, detail=f"Image generation failed across models: {last_error}")


@router.post("/tts", response_model=GenerateTTSResponse)
async def generate_tts(req: GenerateTTSRequest):
    """Synthesize expressive character speech using Gemini 3.1 Flash TTS with multi-speaker voice mapping."""
    settings = get_settings()
    api_key = settings.google_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    client = genai.Client(api_key=api_key)

    speaker_clean = (req.speaker or "NARRATOR").strip().upper()
    voice_selected = req.voice_name
    if not voice_selected:
        voice_selected = VOICE_MAP.get(speaker_clean, VOICE_MAP["DEFAULT"])

    # Construct cinematic delivery guidance for Gemini TTS
    directives: list[str] = []
    if req.delivery_style:
        directives.append(f"Tone: {req.delivery_style}")
    if req.speed and abs(req.speed - 1.0) > 0.05:
        cadence = "deliberate and measured" if req.speed < 1.0 else "urgent and rapid"
        directives.append(f"Cadence: {cadence} ({req.speed:.2f}x)")
    if req.formant_shift and req.formant_shift != 0:
        weight = "deep chest resonance" if req.formant_shift < 0 else "elevated high-tension timbre"
        directives.append(f"Resonance: {weight}")
    if req.reverb_room:
        directives.append(f"Acoustics: {req.reverb_room}")

    prompt_text = f"({', '.join(directives)}) {req.text}" if directives else req.text

    dsp_profile = {
        "delivery_style": req.delivery_style,
        "speed": req.speed or 1.0,
        "pitch_fine": req.pitch_fine or 0.0,
        "formant_shift": req.formant_shift or 0.0,
        "reverb_room": req.reverb_room,
        "reverb_send": req.reverb_send or 0.0,
    }

    tts_models = [
        "models/gemini-3.1-flash-tts-preview",
    ]

    last_err = None
    for m in tts_models:
        try:
            res = client.models.generate_content(
                model=m,
                contents=prompt_text,
                config={
                    "response_modalities": ["AUDIO"],
                    "speech_config": {
                        "voice_config": {
                            "prebuilt_voice_config": {
                                "voice_name": voice_selected
                            }
                        }
                    },
                },
            )
            for part in res.candidates[0].content.parts:
                if part.inline_data is not None and part.inline_data.data:
                    raw_pcm = part.inline_data.data
                    wav_bytes = pcm_to_wav(raw_pcm, sample_rate=24000)
                    b64_wav = base64.b64encode(wav_bytes).decode("utf-8")
                    data_uri = f"data:audio/wav;base64,{b64_wav}"
                    duration = len(raw_pcm) / 48000.0
                    return GenerateTTSResponse(
                        audio_url=data_uri,
                        speaker=speaker_clean,
                        voice_name=voice_selected,
                        duration_estimate_sec=round(duration, 2),
                        dsp_applied=dsp_profile,
                    )
        except Exception as e:  # noqa: BLE001
            last_err = str(e)
            continue

    raise HTTPException(status_code=502, detail=f"TTS synthesis failed: {last_err}")


def resolve_image_bytes(image_url: str | None) -> tuple[bytes | None, str | None]:
    """Extract raw image bytes and mime type from data URI, public static path, or HTTP URL."""
    if not image_url:
        return None, None
    try:
        if image_url.startswith("data:image/"):
            header, encoded = image_url.split(",", 1)
            mime = header.split(";")[0].replace("data:", "")
            return base64.b64decode(encoded), mime
        if image_url.startswith("http://") or image_url.startswith("https://"):
            import httpx
            with httpx.Client(timeout=10.0) as http_client:
                res = http_client.get(image_url)
                if res.is_success:
                    mime = res.headers.get("content-type", "image/jpeg").split(";")[0]
                    return res.content, mime
        if image_url.startswith("/"):
            cleaned = image_url.lstrip("/")
            p = Path(__file__).resolve().parent.parent.parent.parent / "web" / "public" / cleaned
            if p.exists() and p.is_file():
                mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
                return p.read_bytes(), mime
    except Exception as e:
        logger.warning("Could not resolve image bytes from %s: %s", image_url[:60], e)
    return None, None


class GenerateVideoRequest(BaseModel):
    prompt: str = Field(..., description="Cinematic scene visual and camera movement prompt")
    duration_seconds: int = Field(default=5, description="Video duration in seconds (4-8)")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio (16:9)")
    style_preset: str | None = Field(default="35mm Anamorphic Film", description="Film style preset")
    image_url: str | None = Field(default=None, description="Optional character concept or storyboard image reference")
    character_name: str | None = Field(default=None, description="Optional focused character name")


class GenerateVideoResponse(BaseModel):
    operation_name: str
    prompt: str
    status: str
    video_url: str | None = None
    error: str | None = None


@router.post("/video", response_model=GenerateVideoResponse)
async def generate_video(req: GenerateVideoRequest):
    """Dispatch a cinematic scene render to Google Veo 3.1 video generation."""
    settings = get_settings()
    api_key = settings.google_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    client = genai.Client(api_key=api_key)

    character_clause = f" Keep {req.character_name} as the primary subject in frame throughout." if req.character_name else ""
    style_clause = f" Overall visual style: {req.style_preset}." if req.style_preset and req.style_preset.lower() not in req.prompt.lower() else ""
    cinematic_prompt = (
        f"{req.prompt.strip().rstrip('.')}.{character_clause}{style_clause} "
        f"Aspect ratio {req.aspect_ratio}, photoreal depth, consistent lighting and continuity across frames, "
        f"no text or watermarks, no jump cuts."
    )

    duration = max(4, min(8, req.duration_seconds))

    img_bytes, mime = resolve_image_bytes(req.image_url)
    image_arg = None
    if img_bytes:
        from google.genai import types
        image_arg = types.Image(image_bytes=img_bytes, mime_type=mime or "image/jpeg")
        logger.info("Conditioning Veo 3.1 video generation with image reference (%d bytes, %s)", len(img_bytes), mime)

    try:
        kwargs = {
            "model": "models/veo-3.1-fast-generate-preview",
            "prompt": cinematic_prompt,
            "config": {
                "aspect_ratio": req.aspect_ratio,
                "duration_seconds": duration,
            },
        }
        if image_arg is not None:
            kwargs["image"] = image_arg

        op = client.models.generate_videos(**kwargs)
        return GenerateVideoResponse(
            operation_name=op.name,
            prompt=req.prompt,
            status="processing",
        )
    except Exception as e:  # noqa: BLE001
        logger.error("Veo dispatch failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Video generation failed: {e}")


@router.get("/video/status")
async def get_video_status(operation_name: str):
    """Check status of a Google Veo 3.1 video generation job."""
    if not operation_name:
        raise HTTPException(status_code=400, detail="Missing operation_name")

    settings = get_settings()
    api_key = settings.google_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    client = genai.Client(api_key=api_key)

    try:
        from google.genai import types

        op = client.operations.get(types.GenerateVideosOperation(name=operation_name))
        if op.done:
            video_url = None
            if hasattr(op, "response") and op.response and hasattr(op.response, "generated_videos"):
                videos = op.response.generated_videos
                if videos and len(videos) > 0:
                    try:
                        # Save the generated video physically to web/public/videos/
                        target_dir = Path(__file__).resolve().parent.parent.parent.parent / "web" / "public" / "videos"
                        target_dir.mkdir(parents=True, exist_ok=True)
                        file_id = uuid.uuid4().hex[:12]
                        filename = f"veo_{file_id}.mp4"
                        target_path = target_dir / filename

                        # Download the video directly from Google GenAI
                        client.files.download(file=videos[0].video, destination=str(target_path))
                        if target_path.exists() and target_path.stat().st_size > 0:
                            video_url = f"/videos/{filename}"
                    except Exception as dl_err:
                        logger.error("Could not stream Veo file to disk: %s", dl_err)
                        return {
                            "status": "error",
                            "error": f"Video finished rendering but could not be retrieved: {dl_err}",
                            "video_url": None,
                        }

            if not video_url:
                return {
                    "status": "error",
                    "error": "Veo operation completed but returned no video",
                    "video_url": None,
                }

            return {
                "status": "completed",
                "video_url": video_url,
            }
        return {
            "status": "processing",
            "video_url": None,
        }
    except Exception as e:  # noqa: BLE001
        logger.error("Veo status check failed: %s", e)
        return {
            "status": "error",
            "error": str(e),
            "video_url": None,
        }

