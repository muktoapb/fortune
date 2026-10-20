"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, N8AO, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import TowerModel, { D, FLOORS, W, type TowerHandle } from "./TowerModel";
import { story, range } from "@/lib/scroll";

// Scroll timeline (story.t: 0 → 1). Chapter copy windows in Experience.tsx match these.
const T = {
  heroOut: [0.06, 0.2],
  deconstruct: [0.12, 0.24],
  land: [0.2, 0.28, 0.44, 0.52],
  piles: [0.34, 0.46],
  blueprint: [0.48, 0.58, 0.86, 0.95],
  rise: [0.62, 0.84],
  night: [0.82, 0.97],
} as const;

// Camera keyframes: [t, position, target]
const KEYS: [number, THREE.Vector3, THREE.Vector3][] = [
  [0.0, new THREE.Vector3(29, 6, 29), new THREE.Vector3(0, 6.6, 0)],
  [0.27, new THREE.Vector3(10, 36, 24), new THREE.Vector3(0, 0, 2)],
  [0.42, new THREE.Vector3(20, 13, 22), new THREE.Vector3(0, 1, 0)],
  [0.56, new THREE.Vector3(-24, 14, 24), new THREE.Vector3(0, 5, 0)],
  [0.76, new THREE.Vector3(26, 9, 20), new THREE.Vector3(0, 6, 0)],
  [1.0, new THREE.Vector3(10, 3, 33), new THREE.Vector3(0, 6.8, 0)],
];

// Base colours of the tower's glowing trims (trim, canopy, lamps), scaled by time of day.
const GLOW_BASE = ["#ffd27a", "#ffd9a0", "#fff0c8"].map((c) => new THREE.Color(c).multiplyScalar(2.2));

const ease = (x: number) => x * x * (3 - 2 * x);
function sampleKeys(t: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [a, pa, ta] = KEYS[i];
    const [b, pb, tb] = KEYS[i + 1];
    if (t <= b || i === KEYS.length - 2) {
      const k = ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
      pos.lerpVectors(pa, pb, k);
      tgt.lerpVectors(ta, tb, k);
      return;
    }
  }
}

// Sunset → night.
const SUNSET = { top: new THREE.Color("#16244a"), mid: new THREE.Color("#b8644a"), low: new THREE.Color("#f0b47a") };
const NIGHT = { top: new THREE.Color("#04070f"), mid: new THREE.Color("#0c1630"), low: new THREE.Color("#2c2440") };

function Sky({ night }: { night: { v: number } }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: SUNSET.top.clone() },
          uMid: { value: SUNSET.mid.clone() },
          uLow: { value: SUNSET.low.clone() },
          uSun: { value: 1 },
        },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform float uSun; varying vec3 vP;
          void main(){
            float h = vP.y;
            vec3 c = mix(uLow, uMid, smoothstep(-0.02, 0.18, h));
            c = mix(c, uTop, smoothstep(0.15, 0.6, h));
            vec3 sunDir = normalize(vec3(0.97, 0.06, 0.2));
            float s = max(dot(vP, sunDir), 0.0);
            c += vec3(1.0, 0.65, 0.35) * (pow(s, 24.0) * 0.8 + pow(s, 4.0) * 0.22) * uSun;
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  );
  useFrame(() => {
    const n = night.v;
    mat.uniforms.uTop.value.copy(SUNSET.top).lerp(NIGHT.top, n);
    mat.uniforms.uMid.value.copy(SUNSET.mid).lerp(NIGHT.mid, n);
    mat.uniforms.uLow.value.copy(SUNSET.low).lerp(NIGHT.low, n);
    mat.uniforms.uSun.value = 1 - n;
  });
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

function Stars({ night }: { night: { v: number } }) {
  const ref = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const n = 700;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * 0.45 * Math.PI;
      p.set([Math.cos(th) * Math.sin(ph) * 300, Math.cos(ph) * 300, Math.sin(th) * Math.sin(ph) * 300], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame(() => ref.current && (ref.current.opacity = night.v));
  return (
    <points geometry={geo}>
      <pointsMaterial ref={ref} size={1.1} sizeAttenuation={false} color="#fff6e0" transparent opacity={0} depthWrite={false} />
    </points>
  );
}

/** Land, three roads, plot outline, foundation piles and a dim city around. */
function Site({ glow, piles }: { glow: { v: number }; piles: { v: number } }) {
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#e8a83c").multiplyScalar(1.7), transparent: true, opacity: 0, toneMapped: false }),
    [],
  );
  const pileGroup = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const px = W / 2 + 1.4;
    const pz = D / 2 + 1.4;
    const t = 0.08;
    const L: [number, number, number, number][] = [
      // plot outline: [w, d, x, z]
      [px * 2, t, 0, pz],
      [px * 2, t, 0, -pz],
      [t, pz * 2, px, 0],
      [t, pz * 2, -px, 0],
      // road edges: 20 ft front (z+), 10 ft west (x-) and north (z-)
      [90, t, 0, pz + 0.4],
      [90, t, 0, pz + 3.4],
      [t, 90, -px - 0.4, 0],
      [t, 90, -px - 2.0, 0],
      [90, t, 0, -pz - 0.4],
      [90, t, 0, -pz - 2.0],
    ];
    return L;
  }, []);

  const city = useMemo(() => {
    const r = (() => {
      let s = 7;
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    })();
    const m = new THREE.Matrix4();
    const items: THREE.Matrix4[] = [];
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2;
      const d = 55 + r() * 80;
      const h = 2 + r() * r() * 14;
      const w = 3 + r() * 6;
      items.push(m.clone().compose(new THREE.Vector3(Math.cos(a) * d, h / 2, Math.sin(a) * d), new THREE.Quaternion(), new THREE.Vector3(w, h, w * (0.6 + r()))));
    }
    return items;
  }, []);
  const cityRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = cityRef.current;
    if (!mesh) return;
    city.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [city]);

  useFrame(() => {
    glowMat.opacity = glow.v;
    const g = pileGroup.current;
    if (g) {
      g.visible = piles.v > 0.001;
      g.children.forEach((c, i) => {
        const k = Math.min(1, Math.max(0, piles.v * 1.6 - (i / g.children.length) * 0.6));
        c.scale.set(1, Math.max(0.001, k), 1);
      });
    }
  });

  const piles6x5 = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) out.push([-5.5 + i * 2.2, -4.4 + j * 2.2]);
    return out;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#1b1f1c" roughness={1} />
      </mesh>
      {/* plot */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} receiveShadow>
        <planeGeometry args={[W + 2.8, D + 2.8]} />
        <meshStandardMaterial color="#3a342b" roughness={1} />
      </mesh>
      {/* roads */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, D / 2 + 1.4 + 1.9]}>
        <planeGeometry args={[90, 3]} />
        <meshStandardMaterial color="#24272d" roughness={0.6} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-W / 2 - 1.4 - 1.2, 0.011, 0]}>
        <planeGeometry args={[1.6, 90]} />
        <meshStandardMaterial color="#2b2e35" roughness={0.75} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.011, -D / 2 - 1.4 - 1.2]}>
        <planeGeometry args={[90, 1.6]} />
        <meshStandardMaterial color="#2b2e35" roughness={0.75} />
      </mesh>
      {lines.map(([w, d, x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} material={glowMat}>
          <boxGeometry args={[w, 0.02, d]} />
        </mesh>
      ))}
      <group ref={pileGroup}>
        {piles6x5.map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}>
            <cylinderGeometry args={[0.18, 0.18, 1.2, 10]} />
            <meshStandardMaterial color="#8d857a" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={cityRef} args={[undefined, undefined, city.length]} castShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#232838" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

export default function StoryScene({ quality }: { quality: "high" | "low" }) {
  const tower = useRef<TowerHandle>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { camera, size, scene } = useThree();

  const state = useMemo(
    () => ({
      night: { v: 0 },
      glow: { v: 0 },
      piles: { v: 0 },
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      look: new THREE.Vector3(0, 6, 0),
      fogDay: new THREE.Color("#7a4a45"),
      fogNight: new THREE.Color("#0e1428"),
    }),
    [],
  );

  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#7a4a45", 60, 260);
    return () => void (scene.fog = null);
  }, [scene]);

  useFrame((s, dt) => {
    const t = story.t;
    const k = Math.min(1, dt * 3.2); // camera damping

    // --- build state ---
    const decon = range(t, T.deconstruct[0], T.deconstruct[1]);
    const rise = range(t, T.rise[0], T.rise[1]);
    const floors = tower.current?.floors ?? [];
    const n = FLOORS + 1;
    floors.forEach((g, i) => {
      if (!g) return;
      // top floors leave first, bottom floors come back first
      const out = Math.min(1, Math.max(0, decon * n - (n - 1 - i)));
      const back = Math.min(1, Math.max(0, rise * n - i));
      const v = Math.max(1 - out, back);
      const e = v * v * (3 - 2 * v);
      g.scale.y = Math.max(0.0001, e);
      g.visible = e > 0.001;
    });
    const roof = tower.current?.roof;
    if (roof) {
      const v = Math.max(1 - Math.min(1, decon * n), Math.min(1, Math.max(0, rise * n - (n - 1))));
      roof.visible = v > 0.01;
      roof.scale.setScalar(Math.max(0.0001, v));
    }
    // forecourt follows the ground floor
    const land = tower.current?.landscape;
    const g0 = floors[0];
    if (land && g0) {
      land.visible = g0.visible;
      land.scale.setScalar(Math.max(0.0001, g0.scale.y));
    }

    state.glow.v = range(t, T.land[0], T.land[1]) * (1 - range(t, T.land[2], T.land[3]));
    state.piles.v = range(t, T.piles[0], T.piles[1]) * (1 - range(t, T.rise[0], T.rise[0] + 0.05));
    const bp = range(t, T.blueprint[0], T.blueprint[1]) * (1 - range(t, T.blueprint[2], T.blueprint[3]));
    const night = range(t, T.night[0], T.night[1]);
    state.night.v = night;

    if (tower.current) {
      tower.current.blueprint.opacity = bp * 0.9;
      tower.current.litWindows.emissiveIntensity = 0.5 + night * 2;
      const gk = 0.75 + night * 0.6;
      tower.current.glow.forEach((m, i) => m.color.copy(GLOW_BASE[i]).multiplyScalar(gk));
    }
    if (sun.current) sun.current.intensity = 3.2 * (1 - night * 0.95);
    if (moon.current) moon.current.intensity = 0.9 * night;
    if (hemi.current) hemi.current.intensity = 0.5 - night * 0.3;
    scene.environmentIntensity = 0.8 * (1 - night * 0.7);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(state.fogDay).lerp(state.fogNight, night);

    // --- camera ---
    sampleKeys(t, state.pos, state.tgt);
    const orbit = 1 - range(t, T.heroOut[0], T.heroOut[1]);
    if (orbit > 0) {
      const a = s.clock.elapsedTime * 0.06 * orbit;
      const x = state.pos.x * Math.cos(a) - state.pos.z * Math.sin(a);
      const z = state.pos.x * Math.sin(a) + state.pos.z * Math.cos(a);
      state.pos.x = x;
      state.pos.z = z;
    }
    state.pos.x += s.pointer.x * 1.6;
    state.pos.y += s.pointer.y * 0.9;
    camera.position.lerp(state.pos, k);
    state.look.lerp(state.tgt, k);
    camera.lookAt(state.look);

    // Shift the frame so the tower sits right of the copy on wide screens.
    const pc = camera as THREE.PerspectiveCamera;
    const shift = size.width >= 1024 ? -size.width * 0.17 : 0;
    const v = pc.view?.enabled ? pc.view : null;
    if (shift === 0) {
      if (v) pc.clearViewOffset();
    } else if (!v || v.offsetX !== shift || v.fullWidth !== size.width || v.fullHeight !== size.height) {
      pc.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    }
  });

  const high = quality === "high";
  return (
    <>
      <Sky night={state.night} />
      <Stars night={state.night} />
      <hemisphereLight ref={hemi} args={["#ffcfa8", "#1a1c26", 0.5]} />
      <directionalLight
        ref={sun}
        position={[34, 9, 7]}
        color="#ffa968"
        intensity={3.2}
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
        shadow-camera-far={90}
      />
      <directionalLight position={[-10, 14, 30]} color="#8fa6e8" intensity={0.5} />
      <directionalLight ref={moon} position={[20, 30, 10]} color="#8aa2ff" intensity={0} />
      <Environment resolution={128} frames={1} environmentIntensity={0.8}>
        <color attach="background" args={["#2a2238"]} />
        <Lightformer form="rect" intensity={2.2} color="#3a4a80" position={[0, 25, 0]} rotation-x={Math.PI / 2} scale={[60, 60, 1]} />
        <Lightformer form="rect" intensity={3} color="#ff9a5c" position={[30, 4, 8]} scale={[30, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#f4e8d8" position={[-25, 4, -10]} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#c9b89c" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[60, 60, 1]} />
      </Environment>
      <Site glow={state.glow} piles={state.piles} />
      <TowerModel ref={tower} shadows={high} />
      {high && (
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={0.6} quality="medium" halfRes />
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={1} luminanceSmoothing={0.15} />
          <SMAA />
          <Vignette offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}
