#!/usr/bin/env python3
"""
scripts/generate-audio.py — pre-renders real human audio clips (Piper TTS, MIT-licensed
en_US-hfc_female-medium voice) for every string in scripts/audio-gen/texts.json.

Output: audio/clips/<hash>.mp3 (one per unique string) + audio/manifest.json (a JSON array
of every hash that has a clip, so script.js can look up "do I have real audio for this text?"
in O(1) before falling back to the browser's speechSynthesis).

The hash (FNV-1a 32-bit) is reproduced identically in JS (see script.js audioKey()) so both
sides agree on filenames without needing to ship the text list itself to the browser.

Usage:
  pip install piper-tts
  python -m piper.download_voices en_US-hfc_female-medium --download-dir scripts/audio-gen
  python scripts/generate-audio.py
Safe to re-run: skips any hash whose mp3 already exists (only new/changed curriculum text
triggers new synthesis).
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXTS_FILE = ROOT / "scripts" / "audio-gen" / "texts.json"
VOICE_DIR = ROOT / "scripts" / "audio-gen"
MODEL = VOICE_DIR / "en_US-hfc_female-medium.onnx"
CLIPS_DIR = ROOT / "audio" / "clips"
MANIFEST = ROOT / "audio" / "manifest.json"


def fnv1a(s: str) -> str:
    h = 0x811C9DC5
    for ch in s.encode("utf-8"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def main():
    if not MODEL.exists():
        print("Voice model not found at", MODEL, file=sys.stderr)
        print("Run: python -m piper.download_voices en_US-hfc_female-medium --download-dir scripts/audio-gen", file=sys.stderr)
        sys.exit(1)

    texts = json.loads(TEXTS_FILE.read_text(encoding="utf-8"))
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)

    from piper import PiperVoice

    voice = PiperVoice.load(str(MODEL))

    manifest = set()
    if MANIFEST.exists():
        manifest = set(json.loads(MANIFEST.read_text(encoding="utf-8")))

    made, skipped = 0, 0
    for i, text in enumerate(texts):
        h = fnv1a(text)
        mp3_path = CLIPS_DIR / (h + ".mp3")
        manifest.add(h)
        if mp3_path.exists():
            skipped += 1
            continue

        wav_path = CLIPS_DIR / (h + ".wav")
        with wave.open(str(wav_path), "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)

        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-codec:a", "libmp3lame", "-qscale:a", "4", str(mp3_path)],
            check=True,
        )
        wav_path.unlink()
        made += 1
        if (i + 1) % 100 == 0:
            print(f"...{i + 1}/{len(texts)}", file=sys.stderr)

    MANIFEST.write_text(json.dumps(sorted(manifest)), encoding="utf-8")
    print(f"Done. Generated {made} new clips, {skipped} already existed. Manifest has {len(manifest)} entries.", file=sys.stderr)


if __name__ == "__main__":
    main()
