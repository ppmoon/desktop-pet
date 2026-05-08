import { useEffect, useState } from "react";
import { listPets } from "../pet/loader";

interface Props {
  onSelect: (petId: string) => void;
  currentPetId: string | null;
}

interface PetEntry {
  id: string;
  displayName: string;
}

export function PetSelector({ onSelect, currentPetId }: Props) {
  const [pets, setPets] = useState<PetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPets()
      .then((dirs) => {
        // Try to load manifest names - fall back to dir name
        const entries = dirs.map((id) => ({ id, displayName: id }));
        setPets(entries);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={styles.container}>Scanning for pets...</div>;
  }

  if (pets.length === 0) {
    return (
      <div style={styles.container}>
        <h3>No pets found</h3>
        <p style={{ marginTop: 8 }}>
          Place pet folders in <code>~/.pet/pets/&lt;pet-id&gt;/</code>
        </p>
        <p style={{ marginTop: 4 }}>
          Each folder needs <code>pet.json</code> and{" "}
          <code>spritesheet.webp</code>
        </p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Compatible with petdex format (8x9 atlas, 192x208 frames)
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: 12 }}>Select a Pet</h3>
      <div style={styles.grid}>
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => onSelect(pet.id)}
            style={{
              ...styles.card,
              ...(pet.id === currentPetId ? styles.activeCard : {}),
            }}
          >
            {pet.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    textAlign: "center",
    color: "#fff",
    background: "rgba(0,0,0,0.85)",
    borderRadius: 8,
    minWidth: 280,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  card: {
    padding: "10px 16px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  activeCard: {
    borderColor: "#4a90d9",
    background: "rgba(74,144,217,0.2)",
  },
};
