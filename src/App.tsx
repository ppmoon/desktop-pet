import { useState, useEffect, useCallback, useRef } from "react";
import { CommandPalette } from "./core/CommandPalette";
import { PetWindow } from "./components/PetWindow";
import { registry } from "./core/registry";
import { createPetExtension } from "./extensions/pet";
import type { LoadedPet } from "./pet/types";

type View = "palette" | "pet";

export function App() {
  const [view, setView] = useState<View>("palette");
  const [currentPetId, setCurrentPetId] = useState<string | null>(() =>
    localStorage.getItem("desktop-pet:current"),
  );

  const handleSelectPetRef = useRef<(petId: string) => void>(() => {});

  handleSelectPetRef.current = useCallback((petId: string) => {
    setCurrentPetId(petId);
    localStorage.setItem("desktop-pet:current", petId);
    setView("pet");
  }, []);

  // Register pet extension once, using a stable callback via ref
  useEffect(() => {
    registry.register(
      createPetExtension((petId) => handleSelectPetRef.current(petId)),
    );
  }, []);

  // When window gets focus (e.g. via Alt+Space), show palette
  useEffect(() => {
    function onFocus() {
      setView("palette");
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleBackToPalette = useCallback(() => {
    setView("palette");
  }, []);

  const handlePetLoaded = useCallback((pet: LoadedPet) => {
    document.title = pet.manifest.displayName;
  }, []);

  if (view === "pet" && currentPetId) {
    return (
      <PetWindow
        petId={currentPetId}
        onSwitchPet={handleBackToPalette}
        onPetLoaded={handlePetLoaded}
      />
    );
  }

  return <CommandPalette />;
}
