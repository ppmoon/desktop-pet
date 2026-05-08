interface AppSwitcherProps {
  extensions: { id: string; displayName: string; icon?: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function AppSwitcher({ extensions, activeId, onSelect }: AppSwitcherProps) {
  return (
    <div style={styles.container}>
      {extensions.map((ext) => (
        <button
          key={ext.id}
          onClick={() => onSelect(ext.id)}
          title={ext.displayName}
          style={{
            ...styles.tab,
            ...(ext.id === activeId ? styles.tabActive : {}),
          }}
        >
          {ext.icon ?? ext.displayName[0]}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    paddingRight: 8,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  tab: {
    width: 36,
    height: 36,
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 6,
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    transition: "background 0.15s, color 0.15s",
  },
  tabActive: {
    background: "rgba(74,144,217,0.2)",
    borderColor: "rgba(74,144,217,0.4)",
    color: "#fff",
  },
};
