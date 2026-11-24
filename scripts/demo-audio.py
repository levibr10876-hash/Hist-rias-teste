"""Synthesize an original score, with transient cues on the editorial cuts."""
import math
import random
import struct
import wave
from pathlib import Path

rate = 24000
randomizer = random.Random(24)
score = bytearray()
for i in range(rate * 15):
    t = i / rate
    beat = t % .5
    chord = [55, 65.406, 49, 55][min(int(t / 4), 3)]
    bass = math.sin(math.tau * chord * t) * .20 * math.exp(-beat * 6)
    kick = math.sin(math.tau * (46 * beat + 5 * (1 - math.exp(-beat * 42)))) * .22 * math.exp(-beat * 18)
    pluck = sum(math.sin(math.tau * chord * interval * t) for interval in (2, 3, 4)) * .033 * math.exp(-(t % .25) * 11)
    noise = randomizer.uniform(-1, 1)
    hat = noise * .1 * math.exp(-((t + .25) % .5) * 64)
    hit = 0
    for cue in (0, 3.5, 7.3, 11):
        d = t - cue
        if 0 <= d < .38:
            hit += .34 * math.exp(-d * 16)
            kick += .15 * math.sin(math.tau * (76 * d + 2 * (1 - math.exp(-d * 33)))) * math.exp(-d * 12)
    fade = min(1, t * 135, (15 - t) * 3)
    sample = (bass + kick + pluck + hat + noise * hit) * fade
    score.extend(struct.pack('<h', int(max(-1, min(1, sample)) * 32760)))
with wave.open(str(Path(__file__).resolve().parents[1] / 'public' / 'demo.wav'), 'wb') as output:
    output.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    output.writeframes(score)
