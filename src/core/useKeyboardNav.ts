import { useCallback } from "react";

interface UseKeyboardNavOptions {
  resultCount: number;
  selectedIndex: number;
  setSelectedIndex: (i: number) => void;
  onSelectCurrent: () => void;
  onEscape: () => void;
}

export function useKeyboardNav({
  resultCount,
  selectedIndex,
  setSelectedIndex,
  onSelectCurrent,
  onEscape,
}: UseKeyboardNavOptions) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(
            selectedIndex < resultCount - 1 ? selectedIndex + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            selectedIndex > 0 ? selectedIndex - 1 : resultCount - 1,
          );
          break;
        case "Home":
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setSelectedIndex(resultCount - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (resultCount > 0 && selectedIndex >= 0) {
            onSelectCurrent();
          }
          break;
        case "Escape":
          e.preventDefault();
          onEscape();
          break;
      }
    },
    [resultCount, selectedIndex, setSelectedIndex, onSelectCurrent, onEscape],
  );
}
