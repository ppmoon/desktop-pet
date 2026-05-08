import { useEffect, useRef, useState, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { loadPet } from "../pet/loader";
import { SpriteEngine } from "../pet/engine";
import { onMouseMove, onUserInteraction } from "../pet/behavior";
import type { LoadedPet } from "../pet/types";

interface Props {
  petId: string;
  onSwitchPet: () => void;
  onPetLoaded: (pet: LoadedPet) => void;
}

export function PetWindow({ petId, onSwitchPet, onPetLoaded }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpriteEngine | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    loadPet(petId)
      .then((loaded) => {
        if (cancelled) return;
        onPetLoaded(loaded);

        const engine = new SpriteEngine(loaded);
        engineRef.current = engine;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const atlas = loaded.manifest.atlas;
        canvas.width = atlas.frameWidth;
        canvas.height = atlas.frameHeight;

        let lastTime = performance.now();

        function loop(now: number) {
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          engine.update(dt);
          render(engine, canvas!);
          rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [petId, onPetLoaded]);

  function render(engine: SpriteEngine, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frame = engine.getFrame();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      engine.pet.image,
      frame.sx, frame.sy, frame.sw, frame.sh,
      0, 0, frame.sw, frame.sh,
    );
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!engineRef.current) return;
    onMouseMove({
      engine: engineRef.current,
      cursorX: e.clientX,
      cursorY: e.clientY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  }, []);

  const handleClick = useCallback(() => {
    if (!engineRef.current) return;
    onUserInteraction({
      engine: engineRef.current,
      cursorX: window.innerWidth / 2,
      cursorY: window.innerHeight / 2,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      getCurrentWindow().startDragging();
    }
  }, []);

  if (error) {
    return (
      <div style={styles.error}>
        <p>Failed to load pet: {error}</p>
        <button onClick={onSwitchPet} style={styles.button}>
          Switch Pet
        </button>
      </div>
    );
  }

  return (
    <div
      style={styles.container}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseDown={handleDragStart}
      data-tauri-drag-region
    >
      <canvas id="pet-canvas" ref={canvasRef} style={styles.canvas} />
      <div style={styles.controls} onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwitchPet();
          }}
          style={styles.switchBtn}
          title="Back to palette"
        >
          🔍
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    background: "transparent",
    cursor: "grab",
  },
  canvas: {
    imageRendering: "pixelated",
    pointerEvents: "none",
  },
  controls: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  switchBtn: {
    background: "rgba(0,0,0,0.3)",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 16,
    padding: "4px 8px",
    color: "#fff",
  },
  error: {
    padding: 20,
    textAlign: "center",
    color: "#fff",
    background: "rgba(0,0,0,0.8)",
    borderRadius: 8,
  },
  button: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#4a90d9",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
};
