"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";

/** Gold outline of the tower draws floor by floor, then lifts away. */
export default function Preloader() {
  const { t } = useLang();
  const [p, setP] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    const start = performance.now();
    const dur = 1900;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      setP(1 - Math.pow(1 - k, 3));
      if (k < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setGone(true), 350);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const floors = 10;
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-paper transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        gone ? "pointer-events-none -translate-y-8 opacity-0" : ""
      }`}
    >
      <svg viewBox="0 0 80 120" className="h-40 w-auto">
        <path
          d="M10 118V18l30-14 30 14v100"
          fill="none"
          stroke="#c9a35c"
          strokeWidth="1"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
        {Array.from({ length: floors }, (_, i) => {
          const y = 110 - i * 9.5;
          const on = p * floors > i;
          return <line key={i} x1="16" x2="64" y1={y} y2={y} stroke="#d4b27a" strokeWidth="0.8" opacity={on ? 1 : 0.08} style={{ transition: "opacity .3s" }} />;
        })}
      </svg>
      <p className="mt-8 font-display text-6xl tabular-nums">{Math.round(p * 100)}</p>
      <p className="eyebrow mt-3">{t.preloader}</p>
    </div>
  );
}
