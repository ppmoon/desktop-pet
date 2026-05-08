import { invoke } from "@tauri-apps/api/core";
import type { Extension, SearchResult } from "../../core/types";

const FILE_ICON = "📄";
const DIR_ICON = "📁";

interface RawFileResult {
  path: string;
  name: string;
  is_dir: boolean;
  size: number | null;
}

export function createFileSearchExtension(homeDir: string): Extension {
  return {
    id: "file-search",
    displayName: "Files",
    icon: DIR_ICON,
    placeholder: "Search files...",

    async search(query: string): Promise<SearchResult[]> {
      if (!query.trim()) return [];

      const raw = await invoke<RawFileResult[]>("search_files", {
        query: query.trim(),
        baseDir: homeDir,
        limit: 20,
      });

      return raw.map((f) => ({
        id: f.path,
        title: f.name,
        subtitle: f.path,
        icon: f.is_dir ? DIR_ICON : FILE_ICON,
        type: f.is_dir ? "directory" : "file",
      }));
    },

    async onSelect(result: SearchResult): Promise<void> {
      await invoke("open_path", { path: result.id });
    },
  };
}
