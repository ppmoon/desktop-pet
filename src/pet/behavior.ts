import type { SpriteEngine } from "./engine";
import type { PetStateId } from "./types";

export interface InteractionContext {
  engine: SpriteEngine;
  cursorX: number;
  cursorY: number;
  windowWidth: number;
  windowHeight: number;
}

let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_DELAY_MS = 3000;

/**
 * Behavior system: determines which animation state the pet should be in
 * based on user interaction and idle timers.
 */
export function onUserInteraction(ctx: InteractionContext): void {
  resetIdleTimer(ctx);

  const { cursorX, windowWidth } = ctx;
  const edgeThreshold = windowWidth * 0.15;

  if (cursorX < edgeThreshold) {
    ctx.engine.setState("running-left", 600);
  } else if (cursorX > windowWidth - edgeThreshold) {
    ctx.engine.setState("running-right", 600);
  } else {
    const states: PetStateId[] = ["waving", "jumping"];
    const pick = states[Math.floor(Math.random() * states.length)];
    ctx.engine.setState(pick, 1000);
  }
}

function resetIdleTimer(ctx: InteractionContext): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    ctx.engine.setState("idle");
  }, IDLE_DELAY_MS);
}

/** React to cursor position for directional facing */
export function onMouseMove(ctx: InteractionContext): void {
  const { cursorX, windowWidth } = ctx;
  const center = windowWidth / 2;
  // Flip pet based on which side of center the cursor is
  const el = document.getElementById("pet-canvas");
  if (el) {
    el.style.transform = cursorX < center ? "scaleX(-1)" : "scaleX(1)";
  }
}
