export interface Atlas {
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
}

export interface AnimationDef {
  row: number;
  frames: number;
  frameDuration: number; // ms per frame
}

export type PetStateId =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

export interface PetManifest {
  name: string;
  displayName: string;
  version?: string;
  spritesheet: string;
  atlas: Atlas;
  animations: Record<PetStateId, AnimationDef>;
}

export interface LoadedPet {
  manifest: PetManifest;
  image: HTMLImageElement;
}

export const DEFAULT_ATLAS: Atlas = {
  columns: 8,
  rows: 9,
  frameWidth: 192,
  frameHeight: 208,
};

export const STANDARD_ANIMATIONS: Record<PetStateId, AnimationDef> = {
  idle: { row: 0, frames: 6, frameDuration: 120 },
  "running-right": { row: 1, frames: 8, frameDuration: 100 },
  "running-left": { row: 2, frames: 8, frameDuration: 100 },
  waving: { row: 3, frames: 4, frameDuration: 120 },
  jumping: { row: 4, frames: 5, frameDuration: 120 },
  failed: { row: 5, frames: 8, frameDuration: 120 },
  waiting: { row: 6, frames: 6, frameDuration: 120 },
  running: { row: 7, frames: 6, frameDuration: 100 },
  review: { row: 8, frames: 6, frameDuration: 120 },
};
