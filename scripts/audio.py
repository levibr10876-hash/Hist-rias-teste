"""Prepare an audio source or convert ElevenLabs output to frame-based cues."""
import argparse
import base64
import json
import math
from pathlib import Path
import subprocess

cli = argparse.ArgumentParser()
cli.add_argument("operation", choices=["prepare", "cues"])
cli.add_argument("source", type=Path)
cli.add_argument("target", type=Path)
cli.add_argument("--fps", type=int, default=30)
cli.add_argument("--offset", type=int, default=0)
cli.add_argument("--denoise", action="store_true")
cli.add_argument("--mp3", type=Path)
args = cli.parse_args()
if args.operation == "prepare":
    filters = ["highpass=f=45"]
    if args.denoise:
        filters.append("afftdn=nf=-30")
    filters.extend(["loudnorm=I=-18:LRA=9:TP=-2", "alimiter=limit=0.794:level=false"])
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-n", "-i", str(args.source.resolve()),
                    "-vn", "-af", ",".join(filters), "-ar", "48000", "-c:a", "pcm_s16le",
                    str(args.target.resolve())], check=True)
else:
    data = json.loads(args.source.read_text())
    if args.fps <= 0 or args.offset < 0:
        cli.error("FPS deve ser positivo e offset deve ser não negativo.")
    words = []
    if "audio_base64" in data:
        if args.mp3:
            with args.mp3.open("xb") as target:
                target.write(base64.b64decode(data["audio_base64"], validate=True))
        a = data["alignment"]
        chars = a["characters"]
        start = None
        for i, char in enumerate(chars + [" "]):
            if char.isspace():
                if start is not None:
                    words.append(("".join(chars[start:i]), a["character_start_times_seconds"][start],
                                  a["character_end_times_seconds"][i - 1]))
                    start = None
            elif start is None:
                start = i
    else:
        words = [(word["text"], word["start"], word["end"]) for word in data["words"]
                 if word["type"] == "word" and word.get("start") is not None and word.get("end") is not None]
    cues = []
    for i in range(0, len(words), 4):
        group = words[i:i + 4]
        start = round(group[0][1] * args.fps)
        end = math.ceil(group[-1][2] * args.fps)
        if i + 4 < len(words):
            end = min(end, round(words[i + 4][1] * args.fps))
        cues.append({"text": " ".join(word[0] for word in group),
                     "from": start + args.offset, "frames": max(1, end - start)})
    with args.target.open("x") as target:
        json.dump(cues, target, ensure_ascii=False, indent=2)
