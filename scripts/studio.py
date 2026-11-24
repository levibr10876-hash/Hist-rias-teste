"""Validate a project plan, render it and verify the media."""
import argparse
import array
from fractions import Fraction
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def run(*command, capture=False):
    return subprocess.run(command, cwd=ROOT, check=True, capture_output=capture)


def probe(path):
    return json.loads(run("ffprobe", "-v", "error", "-show_streams", "-show_format",
                          "-of", "json", str(path), capture=True).stdout)


def pcm(path, start, duration):
    raw = run("ffmpeg", "-nostdin", "-v", "error", "-ss", str(start), "-i", str(path),
              "-t", str(duration), "-vn", "-ac", "1", "-ar", "8000", "-f", "f32le",
              "-", capture=True).stdout
    return array.array("f", raw)


def validate(plan):
    width, height, fps, frames = (plan[key] for key in ("width", "height", "fps", "frames"))
    require(all(type(n) is int and n > 0 for n in (width, height, fps, frames)),
            "Dimensões, FPS e duração precisam ser inteiros positivos.")
    require(width % 2 == height % 2 == 0 and width * 16 == height * 9,
            "Use dimensões pares na proporção vertical 9:16.")
    brand = plan["brand"]
    require(all(isinstance(brand[key], str) and brand[key].strip()
                for key in ("name", "label", "accent", "ink", "background", "font")),
            "Identidade visual incompleta.")
    require(all(re.fullmatch(r"#[0-9a-fA-F]{6}", brand[key]) for key in ("accent", "ink", "background")),
            "Use cores hexadecimais de seis dígitos.")
    cursor = 0
    scene_ids = set()
    for scene in plan["scenes"]:
        require(scene["from"] == cursor and type(scene["frames"]) is int and scene["frames"] > 0,
                f"Lacuna, sobreposição ou duração inválida: {scene['id']}")
        require(scene["id"] not in scene_ids and scene["look"] in {"hero", "macro", "side", "end"}
                and scene["transition"] in {"cut", "wipe", "flash"}
                and isinstance(scene["lines"], list) and 1 <= len(scene["lines"]) <= 3
                and all(isinstance(line, str) and line.strip() for line in scene["lines"]),
                f"Cena inválida: {scene['id']}")
        scene_ids.add(scene["id"])
        cursor += scene["frames"]
    require(cursor == frames, "A soma das cenas não corresponde à duração.")
    media = {}
    for name, entry in plan["assets"].items():
        path = (PUBLIC / entry["path"]).resolve()
        require(path.is_relative_to(PUBLIC) and path.is_file(), f"Arquivo ausente ou caminho inválido: {name}")
        require(entry.get("credit") and entry.get("license"), f"Registre crédito e licença: {name}")
        media[name] = path
    for scene in plan["scenes"]:
        if "artwork" in scene:
            key = scene["artwork"]
            require(key in media and media[key].suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"},
                    f"Arte de produto inválida: {key}")
    for cue in plan["captions"]:
        require(isinstance(cue["text"], str) and cue["text"].strip(), "Legenda vazia.")
    for cue in plan["captions"] + plan["tracks"]:
        start, duration = cue["from"], cue["frames"]
        require(type(start) is int and type(duration) is int and 0 <= start < start + duration <= frames,
                f"Intervalo fora da timeline: {cue}")
    for track in plan["tracks"]:
        require(track["asset"] in media and 0 <= track["volume"] <= 1, f"Faixa inválida: {track}")
        metadata = probe(media[track["asset"]])
        require(any(stream["codec_type"] == "audio" for stream in metadata["streams"])
                and float(metadata["format"]["duration"]) + 1 / fps >= track["frames"] / fps,
                f"Áudio incompatível ou curto: {track['asset']}")
    for frame in plan["sync"]:
        require(type(frame) is int and frame in {scene["from"] for scene in plan["scenes"][1:]}
                and any(track["from"] <= frame < track["from"] + track["frames"]
                        and track["volume"] > 0 for track in plan["tracks"]),
                f"Marco sem corte ou faixa audível: {frame}")
    return media


def check_markers(plan, media, video):
    fps = plan["fps"]
    for frame in plan["sync"]:
        track = next(t for t in plan["tracks"] if t["from"] <= frame < t["from"] + t["frames"] and t["volume"] > 0)
        offset = frame / fps
        source = pcm(media[track["asset"]], (frame - track["from"]) / fps, .12)
        padding = min(offset, .09)
        result = pcm(video, offset - padding, .30)
        require(len(source) >= 400 and len(result) >= len(source), f"Áudio insuficiente no marco {frame}.")
        energy = math.sqrt(sum(v * v for v in source))
        require(energy > .05, f"Marco sem energia de referência: {frame}")
        matches = []
        for shift in range(0, len(result) - len(source) + 1, 8):
            section = result[shift:shift + len(source)]
            power = math.sqrt(sum(v * v for v in section))
            score = sum(a * b for a, b in zip(source, section)) / (energy * power) if power else 0
            matches.append((score, shift / 8000 - padding))
        score, delay = max(matches)
        require(score >= .60 and abs(delay) <= 1 / fps,
                f"Sincronização no frame {frame}: correlação {score:.2f}, desvio {delay*1000:.0f} ms.")
        print(f"Marco {frame}: desvio {delay*1000:.0f} ms, correlação {score:.2f}")


def quality(plan, media, video):
    metadata = probe(video)
    streams = metadata["streams"]
    visual = next((s for s in streams if s["codec_type"] == "video"), {})
    audio = next((s for s in streams if s["codec_type"] == "audio"), {})
    fps = plan["fps"]
    duration = plan["frames"] / fps
    require((visual.get("width"), visual.get("height"), visual.get("codec_name"), visual.get("pix_fmt"))
            == (plan["width"], plan["height"], "h264", "yuv420p"), "Formato de vídeo incompatível.")
    require(Fraction(visual["avg_frame_rate"]) == fps and int(visual["nb_frames"]) == plan["frames"]
            and abs(float(metadata["format"]["duration"]) - duration) <= 1 / fps,
            "FPS, contagem de frames ou duração incorretos.")
    if plan["tracks"]:
        require(audio.get("codec_name") == "aac" and abs(float(audio.get("start_time", 1))) <= 1 / fps
                and abs(float(audio.get("duration", 0)) - duration) <= 1 / fps,
                "Faixa AAC ausente ou com duração/início divergentes.")
    command = ["ffmpeg", "-nostdin", "-xerror", "-i", str(video), "-vf", "blackframe=amount=98:threshold=24"]
    if audio:
        command += ["-af", "volumedetect"]
    log = run(*command, "-f", "null", "-", capture=True).stderr.decode()
    require("pblack:" not in log, "Frame preto detectado.")
    if audio:
        peak = re.search(r"max_volume: ([-.\d]+) dB", log)
        require(peak and -65 < float(peak[1]) < -.3, "Clipping provável ou áudio inaudível.")
        print(f"Pico de áudio: {peak[1]} dBFS")
    check_markers(plan, media, video)
    print(f"QA de mídia: {visual['width']}×{visual['height']}, {fps} FPS, {duration:g} s, {plan['frames']} frames.")


def render(plan, video, mode):
    with tempfile.TemporaryDirectory() as temp:
        props = Path(temp) / "props.json"
        props.write_text(json.dumps({"plan": plan, "audit": True}))
        executable = os.environ.get("STUDIO_CHROMIUM")
        browser = [f"--browser-executable={executable}"] if executable else []
        options = ["--scale=0.5", "--crf=26"] if mode == "preview" else ["--crf=17"]
        run(str(ROOT / "node_modules/.bin/remotion"), "render", "src/index.tsx", "Promo", str(video),
            f"--props={props}", "--pixel-format=yuv420p", "--color-space=bt709", "--concurrency=2", "--log=error",
            *browser, *options)


def review(plan, video, folder):
    folder.mkdir(parents=True, exist_ok=True)
    samples = sorted({scene["from"] + min(scene["frames"] - 1, x)
                      for scene in plan["scenes"] for x in (0, scene["frames"] // 2, scene["frames"] - 1)})
    selection = "+".join(f"eq(n\\,{frame})" for frame in samples)
    rows = math.ceil(len(samples) / 4)
    run("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(video),
        "-vf", f"select='{selection}',scale=216:384,tile=4x{rows}:padding=8:margin=8:color=0x282828",
        "-frames:v", "1", str(folder / "contact-sheet.png"))
    run("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(video), "-vf", "scale=540:960",
        "-c:v", "libx264", "-crf", "24", "-c:a", "aac", "-movflags", "+faststart",
        str(folder / "previa.mp4"))
    (folder / "frames.json").write_text(json.dumps(samples))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", choices=["validate", "preview", "render", "qa", "review"])
    parser.add_argument("plan", type=Path)
    parser.add_argument("video", type=Path, nargs="?")
    args = parser.parse_args()
    plan = json.loads(args.plan.read_text())
    media = validate(plan)
    if args.operation == "validate":
        print("Plano e arquivos validados.")
        return
    require(args.video is not None, "Informe o caminho do MP4.")
    video = args.video.resolve()
    if args.operation in {"preview", "render"}:
        video.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=video.parent) as temp:
            partial = Path(temp) / "render.mp4"
            render(plan, partial, args.operation)
            if args.operation == "render":
                quality(plan, media, partial)
            partial.replace(video)
    elif args.operation == "qa":
        quality(plan, media, video)
    else:
        review(plan, video, video.parent / "revisao")


if __name__ == "__main__":
    try:
        main()
    except (KeyError, TypeError, ValueError, OSError) as error:
        raise SystemExit(f"Plano ou arquivo inválido: {error}") from error
    except subprocess.CalledProcessError as error:
        if error.stderr:
            print(error.stderr.decode(errors="replace"))
        raise SystemExit(f"Falha em {Path(error.cmd[0]).name} (código {error.returncode}).") from error
