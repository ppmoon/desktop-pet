/**
 * Generates a sample pet spritesheet + pet.json compatible with petdex format.
 * Usage: bun run scripts/generate-sample-pet.ts
 *
 * Creates an 8x9 atlas (192x208 per frame) with placeholder colored blob
 * characters in different poses. The sample pet is saved to ~/.pet/pets/sample/
 */

const COLS = 8;
const ROWS = 9;
const FW = 192;
const FH = 208;
const OUT_DIR = `${require("os").homedir()}/.pet/pets/sample`;

const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

if (typeof createCanvas !== "function") {
  console.log("This script requires the 'canvas' package.");
  console.log("Run: bun add canvas");
  console.log("Or on some systems: bun add @napi-rs/canvas");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const canvas = createCanvas(COLS * FW, ROWS * FH);
const ctx = canvas.getContext("2d");

// Animation row definitions
const anims: Record<string, { row: number; frames: number; frameDuration: number }> = {
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

// Draw a simple blob creature with varying expressions per animation
function drawBlob(ctx: any, cx: number, cy: number, frame: number, frames: number, anim: string) {
  const bobOffset = Math.sin((frame / frames) * Math.PI * 2) * 4;

  // Body
  ctx.fillStyle = "#6C9BCF";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20 + bobOffset, 36, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx - 12, cy - 28 + bobOffset, 8, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 12, cy - 28 + bobOffset, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#222";
  const lookX = anim === "running-right" ? 3 : anim === "running-left" ? -3 : 0;
  ctx.beginPath();
  ctx.ellipse(cx - 12 + lookX, cy - 28 + bobOffset, 4, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 12 + lookX, cy - 28 + bobOffset, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth varies by animation
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (anim === "failed") {
    // Sad mouth
    ctx.arc(cx, cy - 8 + bobOffset, 8, Math.PI * 0.1, Math.PI * 0.9);
  } else if (anim === "waving" || anim === "jumping") {
    // Happy mouth
    ctx.arc(cx, cy - 12 + bobOffset, 8, Math.PI * 0.2, Math.PI * 0.8);
  } else {
    // Neutral mouth
    ctx.moveTo(cx - 6, cy - 10 + bobOffset);
    ctx.lineTo(cx + 6, cy - 10 + bobOffset);
  }
  ctx.stroke();

  // Feet
  ctx.fillStyle = "#5A8AB5";
  ctx.beginPath();
  const footSpread = anim === "running" || anim === "running-right" || anim === "running-left"
    ? Math.sin((frame / frames) * Math.PI * 4) * 10
    : 0;
  ctx.ellipse(cx - 16 + footSpread, cy + 20 + bobOffset, 10, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 16 - footSpread, cy + 20 + bobOffset, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms for waving
  if (anim === "waving") {
    ctx.strokeStyle = "#6C9BCF";
    ctx.lineWidth = 8;
    ctx.beginPath();
    const waveAngle = Math.sin((frame / frames) * Math.PI * 2) * 0.8 - 0.4;
    ctx.moveTo(cx + 30, cy - 15 + bobOffset);
    ctx.lineTo(cx + 30 + Math.cos(waveAngle) * 20, cy - 35 + Math.sin(waveAngle) * 20 + bobOffset);
    ctx.stroke();
  }
}

for (const [name, def] of Object.entries(anims)) {
  const y = def.row * FH;
  for (let f = 0; f < def.frames; f++) {
    const x = f * FW;
    ctx.save();
    ctx.translate(x, y);
    drawBlob(ctx, FW / 2, FH / 2, f, def.frames, name);
    ctx.restore();
  }
}

// Save as PNG (WebP support varies by canvas library)
const outPath = path.join(OUT_DIR, "spritesheet.png");
fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
console.log(`Spritesheet saved: ${outPath}`);

// Generate pet.json
const petJson = {
  name: "sample",
  displayName: "Sample Blob",
  version: "1.0.0",
  spritesheet: "spritesheet.png",
  atlas: {
    columns: COLS,
    rows: ROWS,
    frameWidth: FW,
    frameHeight: FH,
  },
  animations: anims,
};

const jsonPath = path.join(OUT_DIR, "pet.json");
fs.writeFileSync(jsonPath, JSON.stringify(petJson, null, 2));
console.log(`Manifest saved: ${jsonPath}`);
console.log("Sample pet created successfully!");
