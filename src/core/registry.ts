import type { Extension, ExtensionRegistry } from "./types";

class ExtensionRegistryImpl implements ExtensionRegistry {
  private extensions = new Map<string, Extension>();
  private defaultId: string | null = null;

  register(ext: Extension): void {
    this.extensions.set(ext.id, ext);
    if (!this.defaultId) this.defaultId = ext.id;
  }

  setDefault(id: string): void {
    if (this.extensions.has(id)) {
      this.defaultId = id;
    }
  }

  unregister(id: string): void {
    this.extensions.delete(id);
    if (this.defaultId === id) {
      this.defaultId = this.extensions.keys().next().value ?? null;
    }
  }

  get(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  getAll(): Extension[] {
    return Array.from(this.extensions.values());
  }

  getDefault(): Extension | undefined {
    return this.defaultId ? this.extensions.get(this.defaultId) : undefined;
  }
}

export const registry = new ExtensionRegistryImpl();
