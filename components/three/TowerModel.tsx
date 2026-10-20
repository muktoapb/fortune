"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Procedural Fortune Tower, modelled on building.jpeg:
// G+9, 4 flats per floor, cream facade with white slab bands, graphite fins,
// framed windows, glass balconies with metal rails, gold-framed double-height lobby,
// roof crown with louvres, landscaped forecourt.

export const W = 14; // width (x)
export const D = 12; // depth (z)
export const GH = 1.9; // ground floor (double-height lobby)
export const FH = 1.05; // typical floor height
export const FLOORS = 9;
export const TOP = GH + FLOORS * FH;

const BW = W - 0.6; // facade body
const BD = D - 0.6;
const PLOT_X = W / 2 + 1.4;
const PLOT_Z = D / 2 + 1.4;

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}
function rbox(w: number, h: number, d: number, x: number, y: number, z: number, r = 0.04) {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2 - 0.001, w / 2 - 0.001, d / 2 - 0.001)).translate(x, y, z);
}
// Merge mixed indexed / non-indexed geometries into one.
function merge(gs: THREE.BufferGeometry[]) {
  const flat = gs.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") n.deleteAttribute(k);
    return n;
  });
  const m = mergeGeometries(flat)!;
  flat.forEach((g) => g.dispose());
  return m;
}

// Deterministic random so every visit looks the same.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Panel = { w: number; h: number; x: number; y: number; z: number; side: boolean };

/** Window/door with a frame, a centre mullion and a glass pane. */
function framedPanel(p: Panel, frame: THREE.BufferGeometry[]) {
  const t = 0.05;
  const along = (a: number, w: number, h: number, y: number) =>
    p.side ? box(0.07, h, w, p.x, y, p.z + a) : box(w, h, 0.07, p.x + a, y, p.z);
  frame.push(along(0, p.w + t * 2, t, p.y + p.h / 2 + t / 2));
  frame.push(along(0, p.w + t * 2, t, p.y - p.h / 2 - t / 2));
  frame.push(along(-p.w / 2 - t / 2, t, p.h, p.y));
  frame.push(along(p.w / 2 + t / 2, t, p.h, p.y));
  frame.push(along(0, 0.035, p.h, p.y));
  return p.side ? box(0.03, p.h, p.w, p.x, p.y, p.z) : box(p.w, p.h, 0.03, p.x, p.y, p.z);
}

function balcony(x: number, z: number, side: boolean, s: number, white: THREE.BufferGeometry[], glass: THREE.BufferGeometry[], rail: THREE.BufferGeometry[]) {
  const L = 2.5;
  const P = 0.85;
  const h = 0.52;
  if (!side) {
    const zc = s * (BD / 2 + P / 2);
    const zf = s * (BD / 2 + P - 0.03);
    white.push(rbox(L, 0.11, P, x, 0.055, zc, 0.03));
    glass.push(box(L - 0.06, h, 0.025, x, 0.11 + h / 2, zf));
    glass.push(box(0.025, h, P - 0.06, x - L / 2 + 0.03, 0.11 + h / 2, zc));
    glass.push(box(0.025, h, P - 0.06, x + L / 2 - 0.03, 0.11 + h / 2, zc));
    rail.push(box(L, 0.035, 0.05, x, 0.11 + h + 0.02, zf));
    rail.push(box(0.05, 0.035, P, x - L / 2 + 0.03, 0.11 + h + 0.02, zc));
    rail.push(box(0.05, 0.035, P, x + L / 2 - 0.03, 0.11 + h + 0.02, zc));
  } else {
    const xc = s * (BW / 2 + P / 2);
    const xf = s * (BW / 2 + P - 0.03);
    white.push(rbox(P, 0.11, L, xc, 0.055, z, 0.03));
    glass.push(box(0.025, h, L - 0.06, xf, 0.11 + h / 2, z));
    glass.push(box(P - 0.06, h, 0.025, xc, 0.11 + h / 2, z - L / 2 + 0.03));
    glass.push(box(P - 0.06, h, 0.025, xc, 0.11 + h / 2, z + L / 2 - 0.03));
    rail.push(box(0.05, 0.035, L, xf, 0.11 + h + 0.02, z));
    rail.push(box(P, 0.035, 0.05, xc, 0.11 + h + 0.02, z - L / 2 + 0.03));
    rail.push(box(P, 0.035, 0.05, xc, 0.11 + h + 0.02, z + L / 2 - 0.03));
  }
}

function typicalFloor() {
  const wall: THREE.BufferGeometry[] = [box(BW, FH, BD, 0, FH / 2, 0)];
  const white: THREE.BufferGeometry[] = [rbox(W + 0.3, 0.16, D + 0.3, 0, 0.08, 0, 0.05)];
  const fin: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const rail: THREE.BufferGeometry[] = [];
  const frame: THREE.BufferGeometry[] = [];
  const panes: THREE.BufferGeometry[] = [];

  const fz = BD / 2 + 0.02;
  const fx = BW / 2 + 0.02;
  // white corner pilasters
  for (const sx of [1, -1]) for (const sz of [1, -1]) white.push(rbox(0.55, FH, 0.55, sx * (BW / 2 + 0.05), FH / 2, sz * (BD / 2 + 0.05), 0.04));

  for (const s of [1, -1]) {
    // front & back: 4 balconies with sliding doors, graphite fins between
    for (const x of [-4.6, -1.6, 1.6, 4.6]) {
      balcony(x, 0, false, s, white, glass, rail);
      panes.push(framedPanel({ w: 1.9, h: 0.76, x, y: 0.55, z: s * fz, side: false }, frame));
    }
    for (const x of [-3.1, 3.1]) fin.push(rbox(0.38, FH, 0.34, x, FH / 2, s * (BD / 2 + 0.15), 0.03));
    fin.push(box(0.75, FH, 0.12, 0, FH / 2, s * (BD / 2 + 0.06)));
    // sides: 2 balconies and a framed window between pilaster strips
    for (const z of [-3.4, 3.4]) {
      balcony(0, z, true, s, white, glass, rail);
      panes.push(framedPanel({ w: 1.8, h: 0.76, x: s * fx, y: 0.55, z, side: true }, frame));
    }
    panes.push(framedPanel({ w: 1.1, h: 0.55, x: s * fx, y: 0.6, z: 0, side: true }, frame));
    for (const z of [-1.3, 1.3]) fin.push(rbox(0.24, FH, 0.5, s * (BW / 2 + 0.1), FH / 2, z, 0.03));
  }

  return { wall: merge(wall), white: merge(white), fin: merge(fin), glass: merge(glass), rail: merge(rail), frame: merge(frame), panes };
}

/** Split a floor's window panes into lit / unlit sets (varies per floor). */
function splitPanes(panes: THREE.BufferGeometry[], seed: number, litRatio: number) {
  const r = rng(seed);
  const lit: THREE.BufferGeometry[] = [];
  const dark: THREE.BufferGeometry[] = [];
  for (const p of panes) (r() < litRatio ? lit : dark).push(p.clone());
  return { lit: lit.length ? merge(lit) : null, dark: dark.length ? merge(dark) : null };
}

function groundFloor() {
  const stone: THREE.BufferGeometry[] = [];
  for (const x of [-6.6, -3.1, 3.1, 6.6]) for (const z of [-5.6, -1.8, 1.8]) stone.push(rbox(0.6, GH, 0.6, x, GH / 2, z, 0.05));
  for (const x of [-6.6, -3.1, 3.1, 6.6]) stone.push(rbox(0.6, GH, 0.6, x, GH / 2, 5.6, 0.05));
  // back service wall
  stone.push(box(BW, GH, 0.3, 0, GH / 2, -BD / 2 + 0.15));
  const shade = merge([box(BW - 0.3, 0.02, BD - 0.4, 0, 0.01, 0), box(BW - 0.4, GH - 0.05, 0.02, 0, GH / 2, -BD / 2 + 0.32)]);

  // lobby box + gold portal + canopy
  const lobby = box(3.4, GH - 0.1, 2.4, 0, (GH - 0.1) / 2, D / 2 - 1.3);
  const gold = merge([
    rbox(4.1, 0.24, 0.3, 0, GH - 0.12, D / 2 - 0.05, 0.04),
    rbox(0.26, GH, 0.3, -1.92, GH / 2, D / 2 - 0.05, 0.04),
    rbox(0.26, GH, 0.3, 1.92, GH / 2, D / 2 - 0.05, 0.04),
    box(3.6, 0.04, 0.04, 0, GH * 0.55, D / 2 - 0.1), // transom
    box(0.04, GH - 0.3, 0.04, -0.6, (GH - 0.3) / 2, D / 2 - 0.1),
    box(0.04, GH - 0.3, 0.04, 0.6, (GH - 0.3) / 2, D / 2 - 0.1),
  ]);
  const white = merge([
    rbox(4.8, 0.14, 2.6, 0, GH + 0.02, D / 2 + 0.4, 0.05), // canopy
    rbox(5.0, 0.08, 0.9, 0, 0.04, D / 2 + 0.55, 0.03), // steps
    rbox(4.5, 0.08, 0.6, 0, 0.12, D / 2 + 0.35, 0.03),
  ]);
  const canopyGlow = box(4.2, 0.02, 2.0, 0, GH - 0.06, D / 2 + 0.4);
  return { stone: merge(stone), shade, lobby, gold, white, canopyGlow };
}

function roof() {
  const white: THREE.BufferGeometry[] = [
    rbox(W + 0.3, 0.5, 0.22, 0, 0.25, D / 2 + 0.04, 0.04),
    rbox(W + 0.3, 0.5, 0.22, 0, 0.25, -D / 2 - 0.04, 0.04),
    rbox(0.22, 0.5, D + 0.3, W / 2 + 0.04, 0.25, 0, 0.04),
    rbox(0.22, 0.5, D + 0.3, -W / 2 - 0.04, 0.25, 0, 0.04),
    rbox(3.6, 1.4, 3.3, 0, 0.7, -0.5, 0.06), // lift & stair room
    box(BW, 0.1, BD, 0, 0.05, 0),
  ];
  // crown: louvred pergolas over the four corner masses
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const cx = sx * 5.0;
      const cz = sz * (BD / 2 - 0.4);
      white.push(rbox(3.6, 0.12, 0.9, cx, 1.35, cz, 0.03));
      white.push(rbox(0.14, 1.35, 0.14, cx - 1.75, 0.68, cz + sz * 0.35, 0.03));
      white.push(rbox(0.14, 1.35, 0.14, cx + 1.75, 0.68, cz + sz * 0.35, 0.03));
      for (let i = 0; i < 11; i++) white.push(box(0.06, 0.85, 0.06, cx - 1.5 + i * 0.3, 0.9, cz + sz * 0.38));
    }
  const trim = merge([
    box(W + 0.4, 0.04, 0.04, 0, 0.52, D / 2 + 0.17),
    box(W + 0.4, 0.04, 0.04, 0, 0.52, -D / 2 - 0.17),
    box(0.04, 0.04, D + 0.4, W / 2 + 0.17, 0.52, 0),
    box(0.04, 0.04, D + 0.4, -W / 2 - 0.17, 0.52, 0),
  ]);
  return { white: merge(white), trim };
}

function palm(x: number, z: number, h: number, seed: number) {
  const r = rng(seed);
  const lean = new THREE.Vector3((r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6);
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(x, 0, z),
    new THREE.Vector3(x + lean.x * 0.3, h * 0.55, z + lean.z * 0.3),
    new THREE.Vector3(x + lean.x, h, z + lean.z),
  );
  const trunk = new THREE.TubeGeometry(curve, 10, 0.1, 7, false);
  const top = curve.getPoint(1);
  const leaves: THREE.BufferGeometry[] = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const len = 1.3 + r() * 0.5;
    const l = new THREE.ConeGeometry(0.2, len, 4, 3);
    l.scale(1, 1, 0.18);
    l.translate(0, len / 2, 0);
    // bend the frond downward along its length
    const pos = l.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const y = pos.getY(v);
      pos.setZ(v, pos.getZ(v) + (y / len) * (y / len) * 0.55);
    }
    l.rotateX(0.95 + (i % 3) * 0.25);
    l.rotateY((i / n) * Math.PI * 2 + r() * 0.3);
    l.translate(top.x, top.y, top.z);
    leaves.push(l);
  }
  return { trunk, leaves: merge(leaves) };
}

function car(x: number, z: number, rotY: number) {
  const body = merge([rbox(2.0, 0.42, 0.9, 0, 0.36, 0, 0.14), rbox(1.15, 0.36, 0.8, -0.1, 0.72, 0, 0.12)]);
  const wheels = merge(
    [
      [-0.62, 0.42],
      [0.62, 0.42],
      [-0.62, -0.42],
      [0.62, -0.42],
    ].map(([wx, wz]) => new THREE.CylinderGeometry(0.17, 0.17, 0.14, 14).rotateX(Math.PI / 2).translate(wx, 0.17, wz)),
  );
  const glass = merge([box(1.0, 0.24, 0.82, -0.1, 0.74, 0)]);
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));
  return { body: body.applyMatrix4(m), wheels: wheels.applyMatrix4(m), glass: glass.applyMatrix4(m) };
}

/** Forecourt: boundary wall, gate pillars with lamps, planters, cars, palms. */
function landscape() {
  const wall: THREE.BufferGeometry[] = [];
  const h = 0.55;
  const gap = 3.0; // driveway opening at the front
  wall.push(rbox(PLOT_X - gap / 2 - 0.3, h, 0.2, -(PLOT_X + gap / 2 + 0.3) / 2, h / 2, PLOT_Z, 0.04));
  wall.push(rbox(PLOT_X - gap / 2 - 0.3, h, 0.2, (PLOT_X + gap / 2 + 0.3) / 2, h / 2, PLOT_Z, 0.04));
  wall.push(rbox(PLOT_X * 2, h, 0.2, 0, h / 2, -PLOT_Z, 0.04));
  wall.push(rbox(0.2, h, PLOT_Z * 2, PLOT_X, h / 2, 0, 0.04));
  wall.push(rbox(0.2, h, PLOT_Z * 2, -PLOT_X, h / 2, 0, 0.04));
  for (const s of [1, -1]) wall.push(rbox(0.45, 1.1, 0.45, s * (gap / 2 + 0.3), 0.55, PLOT_Z, 0.05));
  // planters along the front
  const planter: THREE.BufferGeometry[] = [];
  const planterSpots: [number, number, number][] = [
    [-5.4, D / 2 + 1.5, 3.2],
    [5.4, D / 2 + 1.5, 3.2],
  ];
  for (const [x, z, w] of planterSpots) planter.push(rbox(w, 0.4, 0.8, x, 0.2, z, 0.05));
  const lamps = merge([box(0.3, 0.12, 0.3, -(gap / 2 + 0.3), 1.16, PLOT_Z), box(0.3, 0.12, 0.3, gap / 2 + 0.3, 1.16, PLOT_Z)]);

  const cars = [car(-1.9, 2.6, 0.08), car(4.6, -1.6, Math.PI / 2 - 0.05), car(-4.6, -1.8, Math.PI / 2)];
  const palms = [palm(-5.4, D / 2 + 1.5, 2.8, 3), palm(5.4, D / 2 + 1.5, 2.5, 9), palm(-PLOT_X + 0.65, D / 2 + 0.85, 2.3, 17), palm(PLOT_X - 0.65, D / 2 + 0.85, 2.6, 23)];
  return {
    wall: merge(wall),
    planter: merge(planter),
    lamps,
    carBody: cars.map((c) => c.body),
    carWheels: merge(cars.map((c) => c.wheels)),
    carGlass: merge(cars.map((c) => c.glass)),
    trunks: merge(palms.map((p) => p.trunk)),
    leaves: merge(palms.map((p) => p.leaves)),
    planterSpots,
  };
}

function Flowers({ spots }: { spots: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 70;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(41);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const palette = ["#c8432a", "#e07a2e", "#d9a43a", "#b8324a", "#5f7a34"];
    for (let i = 0; i < count; i++) {
      const [x, z, w] = spots[i % spots.length];
      const s = 0.12 + r() * 0.12;
      m.compose(
        new THREE.Vector3(x + (r() - 0.5) * (w - 0.2), 0.42 + r() * 0.12, z + (r() - 0.5) * 0.6),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s, s),
      );
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(palette[Math.floor(r() * palette.length)]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [spots]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

export type TowerHandle = {
  floors: (THREE.Group | null)[];
  blueprint: THREE.LineBasicMaterial;
  litWindows: THREE.MeshStandardMaterial;
  glow: THREE.MeshBasicMaterial[];
  roof: THREE.Group | null;
  landscape: THREE.Group | null;
};

/** The building. Each floor group scales from its base so floors can "build" in. */
const TowerModel = forwardRef<TowerHandle, { shadows?: boolean }>(function TowerModel({ shadows = false }, ref) {
  const floors = useRef<(THREE.Group | null)[]>([]);
  const roofRef = useRef<THREE.Group>(null);
  const landRef = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const glow = (c: string, k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });
    return {
      wall: new THREE.MeshStandardMaterial({ color: "#ebe3d4", roughness: 0.9 }),
      white: new THREE.MeshStandardMaterial({ color: "#f7f3ec", roughness: 0.5 }),
      stone: new THREE.MeshStandardMaterial({ color: "#c9c3b8", roughness: 0.8 }),
      shade: new THREE.MeshStandardMaterial({ color: "#5a544b", roughness: 1 }),
      fin: new THREE.MeshStandardMaterial({ color: "#3a3835", roughness: 0.4, metalness: 0.4 }),
      frame: new THREE.MeshStandardMaterial({ color: "#2f2e2c", roughness: 0.35, metalness: 0.7 }),
      rail: new THREE.MeshStandardMaterial({ color: "#3a3936", roughness: 0.25, metalness: 0.9 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#cfe3ea",
        transparent: true,
        opacity: 0.28,
        roughness: 0.03,
        metalness: 0.6,
        depthWrite: false,
      }),
      pane: new THREE.MeshStandardMaterial({ color: "#32485a", roughness: 0.05, metalness: 0.95, envMapIntensity: 1.4 }),
      lit: new THREE.MeshStandardMaterial({
        color: "#32485a",
        roughness: 0.1,
        metalness: 0.7,
        emissive: new THREE.Color("#ffbf70"),
        emissiveIntensity: 0,
        toneMapped: false,
      }),
      lobby: new THREE.MeshStandardMaterial({
        color: "#4a3a20",
        emissive: new THREE.Color("#ffd08a"),
        emissiveIntensity: 1.5,
        toneMapped: false,
      }),
      gold: new THREE.MeshStandardMaterial({ color: "#c9a050", metalness: 1, roughness: 0.22 }),
      trim: glow("#ffd27a", 1.6),
      canopy: glow("#ffd9a0", 1.8),
      lamp: glow("#fff0c8", 2.2),
      trunk: new THREE.MeshStandardMaterial({ color: "#8a6a4a", roughness: 1 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#5d7233", roughness: 0.85, side: THREE.DoubleSide }),
      planter: new THREE.MeshStandardMaterial({ color: "#e9e1d3", roughness: 0.7 }),
      carBodies: ["#c8c9cc", "#2e3238", "#8a1f22"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.7 })),
      tyre: new THREE.MeshStandardMaterial({ color: "#1b1b1b", roughness: 0.9 }),
      carGlass: new THREE.MeshStandardMaterial({ color: "#1c2630", roughness: 0.05, metalness: 0.9 }),
      blueprint: new THREE.LineBasicMaterial({ color: "#f2c66d", transparent: true, opacity: 0, toneMapped: false }),
    };
  }, []);

  const geo = useMemo(() => {
    const f = typicalFloor();
    const windows = Array.from({ length: FLOORS }, (_, i) => splitPanes(f.panes, 11 + i * 7, 0.45));
    f.panes.forEach((p) => p.dispose());
    const g = groundFloor();
    const r = roof();
    const l = landscape();
    const bp: THREE.BufferGeometry[] = [];
    const floorEdge = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, FH, D));
    for (let i = 0; i < FLOORS; i++) bp.push(floorEdge.clone().translate(0, GH + i * FH + FH / 2, 0));
    bp.push(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, GH, D)).translate(0, GH / 2, 0));
    bp.push(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 1.4, 3.3)).translate(0, TOP + 0.7, -0.5));
    const blueprint = mergeGeometries(bp)!;
    return { f, windows, g, r, l, blueprint };
  }, []);

  useImperativeHandle(ref, () => ({
    floors: floors.current,
    blueprint: mats.blueprint,
    litWindows: mats.lit,
    glow: [mats.trim, mats.canopy, mats.lamp],
    roof: roofRef.current,
    landscape: landRef.current,
  }));

  const cs = shadows;
  return (
    <group>
      {/* Ground floor */}
      <group ref={(el) => void (floors.current[0] = el)}>
        <mesh geometry={geo.g.stone} material={mats.stone} castShadow={cs} receiveShadow={cs} />
        <mesh geometry={geo.g.shade} material={mats.shade} />
        <mesh geometry={geo.g.lobby} material={mats.lobby} />
        <mesh geometry={geo.g.gold} material={mats.gold} castShadow={cs} />
        <mesh geometry={geo.g.white} material={mats.white} castShadow={cs} receiveShadow={cs} />
        <mesh geometry={geo.g.canopyGlow} material={mats.canopy} />
      </group>

      {geo.windows.map((w, i) => (
        <group key={i} ref={(el) => void (floors.current[i + 1] = el)} position={[0, GH + i * FH, 0]}>
          <mesh geometry={geo.f.wall} material={mats.wall} castShadow={cs} receiveShadow={cs} />
          <mesh geometry={geo.f.white} material={mats.white} castShadow={cs} receiveShadow={cs} />
          <mesh geometry={geo.f.fin} material={mats.fin} castShadow={cs} />
          <mesh geometry={geo.f.frame} material={mats.frame} />
          <mesh geometry={geo.f.rail} material={mats.rail} />
          {w.dark && <mesh geometry={w.dark} material={mats.pane} />}
          {w.lit && <mesh geometry={w.lit} material={mats.lit} />}
          <mesh geometry={geo.f.glass} material={mats.glass} renderOrder={2} />
        </group>
      ))}

      <group ref={roofRef} position={[0, TOP, 0]}>
        <mesh geometry={geo.r.white} material={mats.white} castShadow={cs} receiveShadow={cs} />
        <mesh geometry={geo.r.trim} material={mats.trim} />
      </group>

      {/* Forecourt */}
      <group ref={landRef}>
      <mesh geometry={geo.l.wall} material={mats.white} castShadow={cs} receiveShadow={cs} />
      <mesh geometry={geo.l.planter} material={mats.planter} castShadow={cs} receiveShadow={cs} />
      <mesh geometry={geo.l.lamps} material={mats.lamp} />
      {geo.l.carBody.map((b, i) => (
        <mesh key={i} geometry={b} material={mats.carBodies[i]} castShadow={cs} />
      ))}
      <mesh geometry={geo.l.carWheels} material={mats.tyre} />
      <mesh geometry={geo.l.carGlass} material={mats.carGlass} />
      <mesh geometry={geo.l.trunks} material={mats.trunk} castShadow={cs} />
      <mesh geometry={geo.l.leaves} material={mats.leaf} castShadow={cs} />
      <Flowers spots={geo.l.planterSpots} />
      </group>

      <lineSegments geometry={geo.blueprint} material={mats.blueprint} />
      <pointLight position={[0, 1.4, D / 2 + 1.4]} color="#ffc27a" intensity={5} distance={8} />
    </group>
  );
});

export default TowerModel;
