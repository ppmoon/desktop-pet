import { useEffect, useRef } from "react";
import type { SearchResult } from "../core/types";

interface ResultsListProps {
  results: SearchResult[];
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
}

export function ResultsList({
  results,
  selectedIndex,
  onSelect,
}: ResultsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (results.length === 0) return null;

  return (
    <div style={styles.container} ref={listRef}>
      {results.map((r, i) => (
        <div
          key={r.id}
          ref={(el) => { itemRefs.current[i] = el; }}
          style={{
            ...styles.row,
            ...(i === selectedIndex ? styles.rowSelected : {}),
          }}
          onClick={() => onSelect(r)}
          onMouseEnter={() => {
            // Allow mouse hover to update selection if desired
            // But don't override keyboard nav — handled by parent
          }}
        >
          <span style={styles.icon}>{r.icon}</span>
          <div style={styles.text}>
            <div style={styles.title}>{r.title}</div>
            {r.subtitle && <div style={styles.subtitle}>{r.subtitle}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxHeight: 264,
    overflowY: "auto",
    padding: "4px 0",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  rowSelected: {
    background: "rgba(74, 144, 217, 0.3)",
  },
  icon: {
    fontSize: 20,
    flexShrink: 0,
    width: 28,
    textAlign: "center",
  },
  text: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
