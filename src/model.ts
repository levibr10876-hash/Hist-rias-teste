export type Look = 'hero' | 'macro' | 'side' | 'end'
export type Transition = 'wipe' | 'flash' | 'cut'
export type Scene = {
  id: string
  from: number
  frames: number
  lines: string[]
  detail: string
  look: Look
  transition: Transition
  artwork?: string
}
export type Plan = {
  width: number
  height: number
  fps: number
  frames: number
  brand: {name: string; label: string; accent: string; ink: string; background: string; font: string}
  scenes: Scene[]
  assets: Record<string, {path: string; credit: string; license: string}>
  tracks: {asset: string; from: number; frames: number; volume: number}[]
  captions: {text: string; from: number; frames: number}[]
  sync: number[]
  depth?: boolean
}
