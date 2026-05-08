/**
 * Generates a sample pet spritesheet + pet.json compatible with petdex format.
 * Usage: node scripts/generate-sample-pet.mjs
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const COLS = 8;
const ROWS = 9;
const FW = 192;
const FH = 208;
const OUT_DIR = join(homedir(), ".pet", "pets", "sample");

mkdirSync(OUT_DIR, { recursive: true });

const anims = {
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

// Generate SVG frames and composite them into a spritesheet
async function generateFrame(anim, frame, frames) {
  const cx = FW / 2;
  const cy = FH / 2;
  const bob = Math.sin((frame / frames) * Math.PI * 2) * 6;
  const phase = frame / frames;

  let mouthSvg = "";
  if (anim === "failed") {
    mouthSvg = `<path d="M${cx - 10},${cy - 8 + bob} Q${cx},${cy + 6 + bob} ${cx + 10},${cy - 8 + bob}" fill="none" stroke="#333" stroke-width="2.5"/>`;
  } else if (anim === "waving" || anim === "jumping") {
    mouthSvg = `<path d="M${cx - 10},${cy - 2 + bob} Q${cx},${cy + 12 + bob} ${cx + 10},${cy - 2 + bob}" fill="none" stroke="#333" stroke-width="2.5"/>`;
  } else {
    mouthSvg = `<line x1="${cx - 8}" y1="${cy - 6 + bob}" x2="${cx + 8}" y2="${cy - 6 + bob}" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  // Eye direction
  let lookX = 0;
  if (anim === "running-right") lookX = 4;
  if (anim === "running-left") lookX = -4;

  // Feet spread for running
  let footSpread = 0;
  if (["running", "running-right", "running-left"].includes(anim)) {
    footSpread = Math.sin(phase * Math.PI * 4) * 14;
  }

  // Arm for waving
  let armSvg = "";
  if (anim === "waving") {
    const angle = Math.sin(phase * Math.PI * 2) * 0.9 - 0.4;
    const ax = cx + 30 + Math.cos(angle) * 24;
    const ay = cy - 30 + Math.sin(angle) * 24 + bob;
    armSvg = `<path d="M${cx + 26},${cy - 18 + bob} Q${cx + 38},${cy - 40 + bob} ${ax},${ay}" fill="none" stroke="#6C9BCF" stroke-width="9" stroke-linecap="round"/>`;
  }

  // Blush for happy states
  let blushSvg = "";
  if (anim === "waving" || anim === "jumping") {
    blushSvg = `
      <ellipse cx="${cx - 20}" cy="${cy - 10 + bob}" rx="7" ry="4" fill="rgba(255,150,150,0.4)"/>
      <ellipse cx="${cx + 20}" cy="${cy - 10 + bob}" rx="7" ry="4" fill="rgba(255,150,150,0.4)"/>
    `;
  }

  const svg = `<svg width="${FW}" height="${FH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="body" cx="40%" cy="35%">
        <stop offset="0%" stop-color="#87CEEB"/>
        <stop offset="100%" stop-color="#4A90D9"/>
      </radialGradient>
      <filter id="soft">
        <feGaussianBlur stdDeviation="0.5"/>
      </filter>
    </defs>
    <!-- body -->
    <ellipse cx="${cx}" cy="${cy - 20 + bob}" rx="40" ry="48" fill="url(#body)"/>
    <!-- belly -->
    <ellipse cx="${cx}" cy="${cy - 10 + bob}" rx="26" ry="30" fill="rgba(255,255,255,0.25)"/>
    <!-- eyes -->
    <ellipse cx="${cx - 14}" cy="${cy - 28 + bob}" rx="10" ry="12" fill="white"/>
    <ellipse cx="${cx + 14}" cy="${cy - 28 + bob}" rx="10" ry="12" fill="white"/>
    <!-- pupils -->
    <circle cx="${cx - 14 + lookX}" cy="${cy - 28 + bob}" r="5" fill="#222"/>
    <circle cx="${cx + 14 + lookX}" cy="${cy - 28 + bob}" r="5" fill="#222"/>
    <!-- eye shine -->
    <circle cx="${cx - 12 + lookX}" cy="${cy - 31 + bob}" r="2" fill="white"/>
    <circle cx="${cx + 16 + lookX}" cy="${cy - 31 + bob}" r="2" fill="white"/>
    ${blushSvg}
    ${mouthSvg}
    <!-- feet -->
    <ellipse cx="${cx - 18 + footSpread}" cy="${cy + 25 + bob}" rx="12" ry="7" fill="#3A7AB5"/>
    <ellipse cx="${cx + 18 - footSpread}" cy="${cy + 25 + bob}" rx="12" ry="7" fill="#3A7AB5"/>
    ${armSvg}
    <!-- failed: X eyes -->
    ${anim === "failed" ? `
      <line x1="${cx - 20}" y1="${cy - 35 + bob}" x2="${cx - 8}" y2="${cy - 23 + bob}" stroke="#900" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx - 8}" y1="${cy - 35 + bob}" x2="${cx - 20}" y2="${cy - 23 + bob}" stroke="#900" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx + 8}" y1="${cy - 35 + bob}" x2="${cx + 20}" y2="${cy - 23 + bob}" stroke="#900" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx + 20}" y1="${cy - 35 + bob}" x2="${cx + 8}" y2="${cy - 23 + bob}" stroke="#900" stroke-width="3" stroke-linecap="round"/>
      <!-- tear -->
      <ellipse cx="${cx - 22}" cy="${cy - 16 + bob}" rx="3" ry="5" fill="#6CB4EE"/>
    ` : ""}
    <!-- review: glasses -->
    ${anim === "review" ? `
      <circle cx="${cx - 14}" cy="${cy - 28 + bob}" r="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="${cx + 14}" cy="${cy - 28 + bob}" r="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="${cx}" y1="${cy - 28 + bob}" x2="${cx}" y2="${cy - 28 + bob}" stroke="#333" stroke-width="2.5"/>
    ` : ""}
  </svg>`;

  return Buffer.from(svg);
}

async function main() {
  const frames = [];

  for (const [name, def] of Object.entries(anims)) {
    for (let f = 0; f < def.frames; f++) {
      const svgBuf = await generateFrame(name, f, def.frames);
      const pngBuf = await sharp(svgBuf).png().toBuffer();
      frames.push({
        input: pngBuf,
        top: def.row * FH,
        left: f * FW,
      });
    }
  }

  // Create transparent background canvas
  const bgSvg = `<svg width="${COLS * FW}" height="${ROWS * FH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="transparent"/>
  </svg>`;
  const bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  await sharp({
    create: {
      width: COLS * FW,
      height: ROWS * FH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(frames)
    .png()
    .toFile(join(OUT_DIR, "spritesheet.png"));

  console.log(`Spritesheet saved: ${join(OUT_DIR, "spritesheet.png")}`);

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

  writeFileSync(join(OUT_DIR, "pet.json"), JSON.stringify(petJson, null, 2));
  console.log(`Manifest saved: ${join(OUT_DIR, "pet.json")}`);
  console.log("Sample pet created!");
}

main().catch(console.error);
