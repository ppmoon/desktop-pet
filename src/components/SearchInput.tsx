import { useRef, useCallback } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: SearchInputProps) {
  const composingRef = useRef(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (composingRef.current) return;
      onKeyDown(e);
    },
    [onKeyDown],
  );

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={() => {
        composingRef.current = false;
      }}
      placeholder={placeholder}
      autoFocus
      style={styles.input}
      spellCheck={false}
      autoComplete="off"
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    caretColor: "#4a90d9",
    fontFamily: "inherit",
  },
};
