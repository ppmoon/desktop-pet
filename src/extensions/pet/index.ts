import type { Extension, SearchResult } from "../../core/types";
import { listPets } from "../../pet/loader";

const PET_ICON = "🐱";

export function createPetExtension(onSelectPet: (petId: string) => void): Extension {
  return {
    id: "pet",
    displayName: "Pets",
    icon: PET_ICON,
    placeholder: "Switch pet...",

    async search(query: string): Promise<SearchResult[]> {
      const dirs = await listPets();
      const q = query.toLowerCase().trim();

      return dirs
        .filter((id) => !q || id.toLowerCase().includes(q))
        .map((id) => ({
          id,
          title: id,
          subtitle: `Pet: ${id}`,
          icon: PET_ICON,
          type: "pet",
        }));
    },

    onSelect(result: SearchResult): void {
      onSelectPet(result.id);
    },
  };
}
