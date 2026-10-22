"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { destinations } from "@/lib/site";
import type { Dict } from "@/lib/i18n";

// Illustrated, schematic map (not to scale). Coordinates are SVG units on a 1000 × 700 board.

type Key = (typeof destinations)[number]["key"];
type Pt = [number, number];
type Box = { x: number; y: number; w: number; h: number };

const VIEW: Box = { x: 0, y: 0, w: 1000, h: 700 };
const PLOT: Pt = [250, 330];

// Road waypoints shared by routes.
const RING: Pt = [330, 330];
const BRIDGE: Pt = [398, 346];
const DIABARI: Pt = [333, 190];
const S18: Pt = [500, 190];
const METRO: Pt = [640, 215];
const AZAMPUR: Pt = [800, 250];
const MIRPUR_JN: Pt = [480, 400];
const DOHS: Pt = [600, 470];
const M12: Pt = [585, 540];

const ROUTES: Record<Key, Pt[]> = {
  ringRoad: [PLOT, RING],
  birulia: [PLOT, RING, BRIDGE],
  sector18: [PLOT, RING, DIABARI, S18],
  navy: [PLOT, RING, BRIDGE, [480, 345], [545, 330]],
  metro: [PLOT, RING, DIABARI, S18, METRO],
  mirpurDohs: [PLOT, RING, BRIDGE, MIRPUR_JN, DOHS],
  mirpur12: [PLOT, RING, BRIDGE, MIRPUR_JN, DOHS, M12],
  mirpur11: [PLOT, RING, BRIDGE, MIRPUR_JN, DOHS, M12, [590, 615]],
  airport: [PLOT, RING, BRIDGE, MIRPUR_JN, DOHS, [700, 430], [796, 385]],
  ecb: [PLOT, RING, BRIDGE, MIRPUR_JN, DOHS, [700, 520], [758, 562]],
  azampur: [PLOT, RING, DIABARI, S18, METRO, AZAMPUR],
  abdullahpur: [PLOT, RING, DIABARI, S18, METRO, AZAMPUR, [812, 110]],
};

// Pin icons (24 × 24 line art). Destinations without one show a plain dot.
const ICONS: Partial<Record<Key, string>> = {
  ringRoad: "M5 22 9 2M19 22 15 2M12 4v3M12 10.5v3M12 17v3",
  birulia: "M2 17h20M2 10c4 0 6 3.5 10 3.5S18 10 22 10M5 17v-5.5M19 17v-5.5M9 17v-4M15 17v-4",
  sector18: "M3 21h18M5 21V8l6-4v17M11 21V10l8 3v8M8 9v.01M8 13v.01M8 17v.01M15 15v.01M15 18v.01",
  navy: "M12 22V8M5 12H2a10 10 0 0 0 20 0h-3M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  metro: "M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM5 10h14M8.5 14h.01M15.5 14h.01M8 21l2-4M16 21l-2-4",
  mirpurDohs: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5",
  airport: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z",
};

const path = (pts: Pt[]) => "M" + pts.map((p) => p.join(",")).join(" L");
const end = (k: Key) => ROUTES[k][ROUTES[k].length - 1];

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** Street blocks filling a district rectangle, a few skipped for variety. */
function blocks(x0: number, y0: number, x1: number, y1: number, size: number, seed: number) {
  const r = rng(seed);
  const out: { x: number; y: number; w: number; h: number; o: number }[] = [];
  for (let x = x0; x < x1; x += size + 8)
    for (let y = y0; y < y1; y += size + 8) {
      if (r() < 0.12) continue;
      out.push({ x, y, w: size * (0.7 + r() * 0.3), h: size * (0.7 + r() * 0.3), o: 0.35 + r() * 0.5 });
    }
  return out;
}

/** Grows a box around its centre to the given aspect ratio, so nothing in it is cropped. */
function fit(b: Box, aspect: number): Box {
  let { w, h } = b;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h };
}

/** Bounding box of points plus padding. */
function bounds(pts: Pt[], padX: number, padY: number): Box {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs) - padX;
  const y = Math.min(...ys) - padY;
  return { x, y, w: Math.max(...xs) + padX - x, h: Math.max(...ys) + padY - y };
}

/** Eases the SVG viewBox toward a target rectangle (camera zoom). */
function useViewBox(target: Box) {
  const [vb, setVb] = useState(VIEW);
  const cur = useRef(VIEW);
  useEffect(() => {
    const from = cur.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 1100);
      const e = 1 - Math.pow(1 - k, 4);
      const next = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      };
      cur.current = next;
      setVb(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return vb;
}

export default function LocationMap({
  active,
  focus,
  onSelect,
  onHover,
  t,
  num,
}: {
  active: Key | null; // highlighted (hover or selected)
  focus: Key | null; // selected: the map zooms to its route
  onSelect: (k: Key) => void;
  onHover: (k: Key | null) => void;
  t: Dict["location"];
  num: (n: number) => string;
}) {
  const uttara = useMemo(() => blocks(450, 40, 780, 300, 22, 3), []);
  const mirpur = useMemo(() => blocks(445, 425, 735, 690, 20, 9), []);
  const fields = useMemo(() => blocks(10, 10, 300, 690, 46, 17), []);

  // Frame to the container's shape: on a tall phone box, show every route instead of cropping the wide board.
  const svgRef = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const aspect = box.w && box.h ? box.w / box.h : VIEW.w / VIEW.h;

  const target = useMemo<Box>(() => {
    if (focus) return fit(bounds(ROUTES[focus], 120, 110), aspect);
    if (aspect >= 1) return VIEW;
    return fit(bounds(Object.values(ROUTES).flat(), 80, 60), aspect);
  }, [focus, aspect]);
  const vb = useViewBox(target);
  // Keeps markers & labels the same size on screen while zoomed; a little larger on narrow boxes.
  const s = (vb.w / VIEW.w) * (box.w ? Math.max(1, Math.sqrt(640 / box.w)) : 1);

  // Every distinct road segment used by any route.
  const roads = useMemo(() => {
    const seen = new Set<string>();
    const segs: [Pt, Pt][] = [];
    for (const pts of Object.values(ROUTES))
      pts.slice(1).forEach((p, i) => {
        const id = `${pts[i]}|${p}`;
        if (!seen.has(id)) {
          seen.add(id);
          segs.push([pts[i], p]);
        }
      });
    return segs;
  }, []);

  const label = active ? `${t.places[active]} · ${num(destinations.find((x) => x.key === active)!.min)} ${t.min}` : "";
  const [lx, ly] = active ? end(active) : [0, 0];
  const river = "M430,-20 C385,120 445,210 398,330 S352,540 415,720";
  const ring = "M338,-20 C326,200 342,430 322,720";

  return (
    <svg
      ref={svgRef}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full select-none"
      role="img"
      aria-label={t.title}
    >
      <defs>
        <pattern id="paddy" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(120,160,90,0.14)" strokeWidth="2" />
        </pattern>
        <linearGradient id="river" x1="0" x2="1">
          <stop offset="0" stopColor="#163a5c" />
          <stop offset="0.5" stopColor="#1f5078" />
          <stop offset="1" stopColor="#163a5c" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="vignette" cx="0.4" cy="0.47" r="0.75">
          <stop offset="0.6" stopColor="#0b1120" stopOpacity="0" />
          <stop offset="1" stopColor="#0b1120" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      <rect x="-600" y="-600" width="2200" height="1900" fill="#0d1424" />

      {/* fields around the plot */}
      {fields.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="#15241a" opacity={b.o} />
      ))}
      <rect x="0" y="0" width="300" height="700" fill="url(#paddy)" />

      {/* city blocks */}
      {[...uttara, ...mirpur].map((b, i) => (
        <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#1b2538" opacity={b.o} />
      ))}

      {/* airport runway */}
      <g transform="rotate(-12 900 400)">
        <rect x="845" y="300" width="70" height="230" rx="6" fill="#18202f" />
        <rect x="872" y="310" width="16" height="210" rx="3" fill="#232d40" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x="878" y={318 + i * 23} width="4" height="12" fill="#3a4660" />
        ))}
      </g>

      {/* Turag river */}
      <path d={river} fill="none" stroke="url(#river)" strokeWidth="30" strokeLinecap="round" />
      <path d={river} fill="none" stroke="#2b6a98" strokeWidth="1.2" opacity="0.6" />

      {/* roads: airport road, 300-ft ring road (under construction), local roads */}
      <path d="M815,-20 L800,250 L790,420 L760,720" stroke="#2a3348" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={ring} stroke="#2a3348" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d={ring} stroke="#d4b27a" strokeWidth={1.4} strokeDasharray="10 8" fill="none" opacity="0.55" />
      {roads.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#2a3348" strokeWidth={6} strokeLinecap="round" />
      ))}
      {/* metro line */}
      <path d="M648,60 L640,215 L628,420 L612,660" stroke="#4b6aa8" strokeWidth={2.4} strokeDasharray="1 7" strokeLinecap="round" fill="none" />

      {/* area labels */}
      <g fill="rgba(238,241,246,0.32)" fontSize={13 * s} letterSpacing={4 * s} fontWeight="600" style={{ fontFamily: "var(--font-sans)" }}>
        <text x="615" y="30" textAnchor="middle">{t.areas.uttara}</text>
        <text x="590" y="700" textAnchor="middle">{t.areas.mirpur}</text>
        <text x="900" y="580" textAnchor="middle">{t.areas.airport}</text>
        <text x="150" y="120" textAnchor="middle">{t.areas.ashulia}</text>
        <text x="190" y="470" textAnchor="middle">{t.areas.birulia}</text>
        <text transform="translate(372 600) rotate(-78)" fill="rgba(91,150,200,0.6)">{t.areas.river}</text>
        <text transform="translate(318 130) rotate(-88)" fill="rgba(212,178,122,0.55)" fontSize={11 * s}>{t.areas.ring}</text>
      </g>

      {/* active route: glow, drawn line, travelling dot */}
      {active && (
        <g key={active} pointerEvents="none">
          <path d={path(ROUTES[active])} fill="none" stroke="#d4b27a" strokeWidth={10 * s} opacity="0.35" filter="url(#glow)" strokeLinejoin="round" />
          <path
            d={path(ROUTES[active])}
            fill="none"
            stroke="#f0d49a"
            strokeWidth={3.2 * s}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          >
            <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.9s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" />
          </path>
          <circle r={4.5 * s} fill="#fff">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={path(ROUTES[active])} begin="0.6s" />
          </circle>
        </g>
      )}

      {/* destination markers */}
      {destinations.map((x) => {
        const [cx, cy] = end(x.key);
        const on = active === x.key;
        return (
          <g key={x.key} onMouseEnter={() => onHover(x.key)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(x.key)} className="cursor-pointer">
            <circle cx={cx} cy={cy} r={18 * s} fill="transparent" />
            {ICONS[x.key] ? (
              <g transform={`translate(${cx} ${cy}) scale(${s * (on ? 1.15 : 1)})`} style={{ transition: "transform .3s" }}>
                <circle r="14" fill={on ? "#f3dfb0" : "#0d1424"} stroke="#d4b27a" strokeWidth="1.6" />
                <path
                  d={ICONS[x.key]}
                  transform="translate(-8.4 -8.4) scale(0.7)"
                  fill="none"
                  stroke={on ? "#0d1424" : "#e8c98f"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              <circle cx={cx} cy={cy} r={(on ? 8 : 5.5) * s} fill={on ? "#f3dfb0" : "#d4b27a"} stroke="#0d1424" strokeWidth={2.5 * s} />
            )}
          </g>
        );
      })}

      {/* Fortune Tower pin */}
      <g transform={`translate(${PLOT[0]} ${PLOT[1]}) scale(${s})`} pointerEvents="none">
        <circle r="10" fill="none" stroke="#ec6a43" strokeWidth="2">
          <animate attributeName="r" from="8" to="40" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.9" to="0" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle r="9" fill="#ec6a43" stroke="#fff" strokeWidth="3" />
        <g transform="translate(0 -26)">
          <rect x="-62" y="-15" width="124" height="28" rx="14" fill="#e8c98f" />
          <text y="4" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0a0f1a" style={{ fontFamily: "var(--font-sans)" }}>
            Fortune Tower
          </text>
        </g>
      </g>

      {/* active destination label */}
      {active && (
        <foreignObject x={lx - 160 * s} y={ly - 56 * s} width={320 * s} height={40 * s} style={{ overflow: "visible", pointerEvents: "none" }}>
          <div style={{ transform: `scale(${s})`, transformOrigin: "0 0", width: 320, display: "flex", justifyContent: "center" }}>
            <span className="rounded-full border border-line bg-cream/95 px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink shadow-lg">
              {label}
            </span>
          </div>
        </foreignObject>
      )}

      <rect x="-600" y="-600" width="2200" height="1900" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  );
}
