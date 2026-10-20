"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { site } from "@/lib/site";

const N = 6; // 6 × 6 = 36 shares
const S = 1.6; // tile size
const GAP = 0.14;
const SPAN = N * S + (N - 1) * GAP;

const COLORS = {
  idle: new THREE.Color("#2a3346"),
  sold: new THREE.Color("#55647e"),
  soldEdge: new THREE.Color("#d4b27a"),
  open: new THREE.Color("#0f5f47"),
  openGlow: new THREE.Color("#34d399"),
};

type Props = {
  locked: { v: number }; // how many shares are shown as sold (animated)
  hovered: number | null;
  onHover: (i: number | null) => void;
  active: boolean;
};

function Tile({ i, locked, hovered, onHover }: { i: number } & Omit<Props, "active">) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.idle.clone(), roughness: 0.55, metalness: 0.05 }), []);
  const row = Math.floor(i / N);
  const col = i % N;
  const x = -SPAN / 2 + S / 2 + col * (S + GAP);
  const z = -SPAN / 2 + S / 2 + row * (S + GAP);

  useFrame((s, dt) => {
    const sold = i < locked.v;
    const available = locked.v >= site.sharesSold && i >= site.sharesSold;
    const pulse = 0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 2.4 + i);
    if (sold) {
      mat.color.lerp(COLORS.sold, Math.min(1, dt * 6));
      mat.emissive.copy(COLORS.soldEdge);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, hovered === i ? 0.25 : 0, Math.min(1, dt * 6));
    } else if (available) {
      mat.color.lerp(COLORS.open, Math.min(1, dt * 6));
      mat.emissive.copy(COLORS.openGlow);
      mat.emissiveIntensity = (hovered === i ? 1.4 : 0.45 + pulse * 0.5);
    } else {
      mat.emissiveIntensity = 0;
    }
    if (mesh.current) {
      const target = hovered === i ? 0.45 : available ? 0.12 + pulse * 0.05 : 0;
      mesh.current.position.y += (target - mesh.current.position.y) * Math.min(1, dt * 8);
    }
  });

  return (
    <mesh
      ref={mesh}
      position={[x, 0, z]}
      material={mat}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(i);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onHover(i);
      }}
    >
      <boxGeometry args={[S, 0.3, S]} />
    </mesh>
  );
}

function Ghost() {
  const ref = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const gs: THREE.BufferGeometry[] = [];
    const h = 0.7;
    for (let i = 0; i < 10; i++) {
      const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(SPAN * 0.78, h, SPAN * 0.66));
      e.translate(0, 0.5 + i * h + h / 2, 0);
      gs.push(e);
    }
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    gs.forEach((e) => pos.push(...(e.attributes.position.array as Float32Array)));
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    gs.forEach((e) => e.dispose());
    return g;
  }, []);
  useFrame((s) => ref.current && (ref.current.opacity = 0.18 + 0.08 * Math.sin(s.clock.elapsedTime * 1.2)));
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={ref} color="#d4b27a" transparent opacity={0.3} />
    </lineSegments>
  );
}

function Rig() {
  const look = useMemo(() => new THREE.Vector3(0, 0.6, 1.2), []);
  useFrame((s, dt) => {
    const a = s.clock.elapsedTime * 0.05;
    const r = 19;
    const tx = Math.sin(a + s.pointer.x * 0.4) * r;
    const tz = Math.cos(a + s.pointer.x * 0.4) * r;
    const k = Math.min(1, dt * 2);
    s.camera.position.x += (tx - s.camera.position.x) * k;
    s.camera.position.z += (tz - s.camera.position.z) * k;
    s.camera.position.y += (16 + s.pointer.y * 2 - s.camera.position.y) * k;
    s.camera.lookAt(look);
  });
  return null;
}

export default function ShareScene(props: Props) {
  const { active, ...tile } = props;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 35, position: [0, 16, 19] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => tile.onHover(null)}
    >
      <hemisphereLight args={["#dfe6ff", "#2a3040", 1.4]} />
      <directionalLight position={[8, 14, 10]} intensity={1.8} color="#ffd6a0" />
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[SPAN + 0.8, 0.2, SPAN + 0.8]} />
        <meshStandardMaterial color="#121a2a" roughness={1} />
      </mesh>
      {Array.from({ length: site.totalShares }, (_, i) => (
        <Tile key={i} i={i} {...tile} />
      ))}
      <Ghost />
      <Rig />
    </Canvas>
  );
}
