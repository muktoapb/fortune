"use client";

import { useState } from "react";
import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import type { Dict } from "@/lib/i18n";
import { bdt, site } from "@/lib/site";

type RoomKey = keyof Dict["home"]["rooms"];
// Illustrative plan of one 1,313 sq ft flat (units are arbitrary SVG units).
const ROOMS: { k: RoomKey; x: number; y: number; w: number; h: number; balcony?: boolean }[] = [
  { k: "bed1", x: 0, y: 0, w: 160, h: 140 },
  { k: "bath", x: 160, y: 0, w: 70, h: 80 },
  { k: "bed2", x: 230, y: 0, w: 140, h: 140 },
  { k: "bath", x: 370, y: 0, w: 110, h: 70 },
  { k: "kitchen", x: 370, y: 70, w: 110, h: 150 },
  { k: "living", x: 0, y: 140, w: 160, h: 160 },
  { k: "dining", x: 160, y: 140, w: 210, h: 260 },
  { k: "bath", x: 370, y: 220, w: 110, h: 80 },
  { k: "bed3", x: 0, y: 300, w: 160, h: 100 },
  { k: "core", x: 370, y: 300, w: 110, h: 100 },
  { k: "balcony", x: 230, y: -40, w: 140, h: 40, balcony: true },
  { k: "balcony", x: -40, y: 150, w: 40, h: 140, balcony: true },
];

export default function Home() {
  const { t, num } = useLang();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <section id="home" className="relative py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <div className="relative rounded-[2rem] border border-line bg-cream/80 p-6 sm:p-10">
            <svg viewBox="-50 -50 580 470" className="w-full" role="img" aria-label={t.home.note}>
              <defs>
                <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(194,163,107,0.35)" strokeWidth="2" />
                </pattern>
              </defs>
              {ROOMS.map((r, i) => {
                const on = hover === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-default"
                  >
                    <rect
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      fill={on ? "rgba(194,163,107,0.22)" : r.balcony ? "url(#hatch)" : r.k === "core" ? "rgba(238,241,246,0.04)" : "transparent"}
                      stroke={on ? "#d4b27a" : "rgba(238,241,246,0.35)"}
                      strokeWidth={on ? 2 : 1.2}
                      style={{ transition: "fill .3s, stroke .3s" }}
                    />
                    <text
                      x={r.x + r.w / 2}
                      y={r.y + r.h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={r.w < 80 || r.h < 50 ? 11 : 14}
                      fill={on ? "#d4b27a" : "rgba(238,241,246,0.7)"}
                      transform={r.w < 50 ? `rotate(-90 ${r.x + r.w / 2} ${r.y + r.h / 2})` : undefined}
                      style={{ transition: "fill .3s", pointerEvents: "none" }}
                    >
                      {t.home.rooms[r.k]}
                    </text>
                  </g>
                );
              })}
              <rect x="0" y="0" width="480" height="400" fill="none" stroke="#c9a35c" strokeWidth="3" />
            </svg>
            <p className="mt-4 text-xs text-mist">{t.home.note}</p>

            {/* key plan: 4 flats per floor */}
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
              <svg viewBox="0 0 44 44" className="h-14 w-14" aria-hidden>
                {[
                  [2, 2],
                  [24, 2],
                  [2, 24],
                  [24, 24],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="18" height="18" fill={i === 0 ? "#c9a35c" : "none"} stroke="rgba(238,241,246,.4)" />
                ))}
                <rect x="17" y="17" width="10" height="10" fill="#0a0f1a" stroke="rgba(238,241,246,.4)" />
              </svg>
              <p className="text-xs leading-snug text-mist">{t.home.perFloor}</p>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow mb-5">{t.home.label}</p>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.home.title}</h2>
            <p className="mt-6 max-w-lg text-ink/70 md:text-lg">{t.home.body}</p>
          </Reveal>
          <Reveal delay={150} as="ul" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {t.home.specs.map((s) => (
              <li key={s} className="rounded-2xl border border-line bg-cream/70 px-4 py-4 text-sm">
                <span className="mb-2 block h-1 w-6 rounded-full bg-brass" />
                {s}
              </li>
            ))}
          </Reveal>
          <Reveal delay={250} className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-7xl text-brass-grad">{num(bdt(site.flatSqft))}</span>
            <span className="text-mist">{t.home.size}</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
