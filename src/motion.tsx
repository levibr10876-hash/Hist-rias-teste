import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion'
import type {Transition} from './model'

export function ramp(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  })
}

export function KineticText({lines, color}: {lines: string[]; color: string}) {
  const frame = useCurrentFrame()
  return <div style={{fontWeight: 900, letterSpacing: '-.067em', lineHeight: .88, fontSize: 149}}>
    {lines.map((line, i) => {
      const progress = ramp(frame, i * 6, i * 6 + 18)
      return <div data-qa-text key={i} style={{
        color: i % 2 ? color : undefined, opacity: progress,
        transform: `translateY(${(1 - progress) * 36}px) skewY(${(1 - progress) * 4}deg)`,
      }}>{line}</div>
    })}
  </div>
}

export function SceneTransition({kind, color}: {kind: Transition; color: string}) {
  const frame = useCurrentFrame()
  if (kind === 'cut' || frame >= 12) return null
  return <AbsoluteFill style={{
    backgroundColor: color,
    opacity: kind === 'flash' ? (1 - ramp(frame, 0, 12)) * .38 : 1,
    transform: kind === 'wipe' ? `translateX(${ramp(frame, 0, 12) * 112}%) skewX(-9deg)` : undefined,
  }}/>
}
