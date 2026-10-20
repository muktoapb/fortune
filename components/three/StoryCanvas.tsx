"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import StoryScene from "./StoryScene";

export default function StoryCanvas({ quality, active }: { quality: "high" | "low"; active: boolean }) {
  const high = quality === "high";
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      shadows={high ? "soft" : false}
      camera={{ fov: 35, near: 0.5, far: 900, position: [26, 7, 26] }}
      gl={{ antialias: !high, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      onCreated={({ gl }) => gl.setClearColor("#0a0f1a")}
    >
      <StoryScene quality={quality} />
    </Canvas>
  );
}
