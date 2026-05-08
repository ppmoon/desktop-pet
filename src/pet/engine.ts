import type { AnimationDef, Atlas, LoadedPet, PetStateId } from "./types";

export interface Frame {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Sprite engine that tracks current animation state and frame.
 */
export class SpriteEngine {
  pet: LoadedPet;
  currentState: PetStateId = "idle";
  currentFrame = 0;
  elapsed = 0;
  private stateOverride: PetStateId | null = null;
  private overrideUntil = 0;
  private onFrameChange?: () => void;

  constructor(pet: LoadedPet) {
    this.pet = pet;
  }

  setOnFrameChange(cb: () => void): void {
    this.onFrameChange = cb;
  }

  get atlas(): Atlas {
    return this.pet.manifest.atlas;
  }

  get anim(): AnimationDef {
    return this.pet.manifest.animations[this.currentState];
  }

  setState(state: PetStateId, durationMs = 0): void {
    if (durationMs > 0) {
      this.stateOverride = state;
      this.overrideUntil = Date.now() + durationMs;
    }
    if (this.currentState === state) return;
    this.currentState = state;
    this.currentFrame = 0;
    this.elapsed = 0;
  }

  update(dt: number): void {
    if (this.stateOverride && Date.now() > this.overrideUntil) {
      this.stateOverride = null;
      this.setState("idle");
    }

    const anim = this.anim;
    this.elapsed += dt * 1000;
    const prevFrame = this.currentFrame;
    if (this.elapsed >= anim.frameDuration) {
      this.elapsed -= anim.frameDuration;
      this.currentFrame = (this.currentFrame + 1) % anim.frames;
      if (this.currentFrame !== prevFrame && this.onFrameChange) {
        this.onFrameChange();
      }
    }
  }

  getFrame(): Frame {
    const { atlas, anim } = this;
    return {
      sx: this.currentFrame * atlas.frameWidth,
      sy: anim.row * atlas.frameHeight,
      sw: atlas.frameWidth,
      sh: atlas.frameHeight,
    };
  }

  /** Calculate display size maintaining aspect ratio at given height */
  getDisplaySize(targetHeight: number): { width: number; height: number } {
    const ratio = this.atlas.frameWidth / this.atlas.frameHeight;
    return {
      width: Math.round(targetHeight * ratio),
      height: targetHeight,
    };
  }
}
