"""Extracts the last frame of a rendered clip so it can be used as the
image-conditioning input for the next chained Veo shot. This is the core
continuity mechanism for multi-shot scene generation: anchoring pixels
(not just a text description) is far stronger than prompt-only continuity.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

_FFMPEG_BIN = shutil.which("ffmpeg")


class FrameExtractionError(RuntimeError):
    pass


async def extract_last_frame(video_path: Path) -> bytes:
    """Returns JPEG bytes of the final frame of the given video file.

    Uses ffmpeg's -sseof (seek from end-of-file) to grab the last frame
    without decoding the whole clip, which stays fast even as chains grow long.
    """
    if not _FFMPEG_BIN:
        raise FrameExtractionError("ffmpeg is not installed or not on PATH")
    if not video_path.exists():
        raise FrameExtractionError(f"video file not found: {video_path}")

    with tempfile.TemporaryDirectory() as tmpdir:
        out_path = Path(tmpdir) / "last_frame.jpg"
        cmd = [
            _FFMPEG_BIN,
            "-y",
            "-sseof",
            "-1",
            "-i",
            str(video_path),
            "-update",
            "1",
            "-q:v",
            "2",
            str(out_path),
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0 or not out_path.exists():
            raise FrameExtractionError(
                f"ffmpeg last-frame extraction failed (code {proc.returncode}): "
                f"{stderr.decode(errors='ignore')[-500:]}"
            )

        return out_path.read_bytes()
