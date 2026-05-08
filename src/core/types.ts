import type { ReactNode } from "react";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  type?: string;
}

export interface Extension {
  id: string;
  displayName: string;
  icon?: string;
  placeholder?: string;
  search(query: string): Promise<SearchResult[]>;
  onSelect(result: SearchResult): void | Promise<void>;
  renderResult?(result: SearchResult): ReactNode;
}

export interface ExtensionRegistry {
  register(ext: Extension): void;
  unregister(id: string): void;
  get(id: string): Extension | undefined;
  getAll(): Extension[];
  getDefault(): Extension | undefined;
}
