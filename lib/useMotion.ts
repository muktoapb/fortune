"use client";

import { useEffect, useState } from "react";

/** null until measured on the client. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Lower quality on small or low-core devices. */
export function isLowTier() {
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores <= 4 || window.innerWidth < 768;
}
