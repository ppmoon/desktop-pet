import { invoke } from "@tauri-apps/api/core";
import type { LoadedPet, PetManifest } from "./types";
import { STANDARD_ANIMATIONS } from "./types";

/**
 * Load a pet from ~/.pet/pets/<petId>/
 * Uses Tauri commands to read files from the filesystem.
 */
export async function loadPet(petId: string): Promise<LoadedPet> {
  const rawJson = await invoke<string>("read_pet_manifest", { petId });
  const raw = JSON.parse(rawJson);
  const manifest = normalizeManifest(raw, petId);

  const bytes = await invoke<number[]>("read_pet_spritesheet", { petId });
  const ext = manifest.spritesheet.split(".").pop()?.toLowerCase() ?? "webp";
  const mime = ext === "png" ? "image/png" : "image/webp";
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load spritesheet"));
  });

  URL.revokeObjectURL(url);
  return { manifest, image: img };
}

/**
 * List available pet directories under ~/.pet/pets/
 */
export async function listPets(): Promise<string[]> {
  return invoke<string[]>("list_pet_dirs");
}

function normalizeManifest(
  raw: Record<string, unknown>,
  fallbackName: string,
): PetManifest {
  const atlas = raw.atlas as Record<string, number> | undefined;
  const rawAnims = (raw.animations ?? {}) as Record<string, Record<string, number>>;

  const animations = { ...STANDARD_ANIMATIONS };
  for (const [key, def] of Object.entries(animations)) {
    const override = rawAnims[key];
    if (override) {
      if (override.row !== undefined) def.row = override.row;
      if (override.frames !== undefined) def.frames = override.frames;
      if (override.frameDuration !== undefined)
        def.frameDuration = override.frameDuration;
    }
  }

  return {
    name: (raw.name as string) ?? fallbackName,
    displayName:
      (raw.displayName as string) ?? (raw.name as string) ?? fallbackName,
    version: raw.version as string | undefined,
    spritesheet: (raw.spritesheet as string) ?? "spritesheet.webp",
    atlas: {
      columns: atlas?.columns ?? 8,
      rows: atlas?.rows ?? 9,
      frameWidth: atlas?.frameWidth ?? 192,
      frameHeight: atlas?.frameHeight ?? 208,
    },
    animations,
  };
}
