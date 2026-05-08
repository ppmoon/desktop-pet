import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getCurrentWindow, PhysicalSize } from "@tauri-apps/api/window";
import { AppSwitcher } from "../components/AppSwitcher";
import { SearchInput } from "../components/SearchInput";
import { ResultsList } from "../components/ResultsList";
import { useKeyboardNav } from "./useKeyboardNav";
import { registry } from "./registry";
import type { SearchResult } from "./types";

export function CommandPalette() {
  const extensions = useMemo(() => registry.getAll(), []);
  const defaultExt = useMemo(() => registry.getDefault(), []);
  const [activeId, setActiveId] = useState<string>(defaultExt?.id ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeExt = useMemo(() => registry.get(activeId), [activeId]);

  const resetSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const ext = registry.get(activeId);
      if (!ext) return;
      ext.onSelect(result);
    },
    [activeId],
  );

  const onEscape = useCallback(() => {
    if (results.length > 0) {
      resetSearch();
    } else if (query) {
      setQuery("");
    } else {
      getCurrentWindow().hide();
    }
  }, [results.length, query, resetSearch]);

  const onSelectCurrent = useCallback(() => {
    if (results.length > 0 && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    }
  }, [results, selectedIndex, handleSelect]);

  const keyDownHandler = useKeyboardNav({
    resultCount: results.length,
    selectedIndex,
    setSelectedIndex,
    onSelectCurrent,
    onEscape,
  });

  // Debounced search
  useEffect(() => {
    if (!activeExt) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await activeExt.search(query);
        setResults(r);
        setSelectedIndex(r.length > 0 ? 0 : -1);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeExt]);

  // Reset on extension switch
  useEffect(() => {
    resetSearch();
  }, [activeId, resetSearch]);

  // Dynamic window resize
  useEffect(() => {
    const win = getCurrentWindow();
    const resultHeight = Math.min(results.length, 6) * 48;
    const totalHeight = 56 + (results.length > 0 ? resultHeight + 8 : 0);
    win.setSize(new PhysicalSize(560, totalHeight)).catch(() => {});
  }, [results.length]);

  const handleSwitchExt = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.palette,
          borderRadius: results.length > 0 ? "12px 12px 0 0" : 12,
        }}
      >
        <AppSwitcher
          extensions={extensions.map((e) => ({
            id: e.id,
            displayName: e.displayName,
            icon: e.icon,
          }))}
          activeId={activeId}
          onSelect={handleSwitchExt}
        />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={activeExt?.placeholder ?? "Type to search..."}
          onKeyDown={keyDownHandler}
        />
        {isSearching && <span style={styles.spinner}>…</span>}
      </div>
      {results.length > 0 && (
        <div style={styles.resultsContainer}>
          <ResultsList
            results={results}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    background: "transparent",
  },
  palette: {
    display: "flex",
    alignItems: "center",
    height: 56,
    background: "rgba(20, 20, 30, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "0 12px",
    gap: 8,
  },
  resultsContainer: {
    background: "rgba(20, 20, 30, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: "0 0 12px 12px",
    overflow: "hidden",
  },
  spinner: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    flexShrink: 0,
  },
};
