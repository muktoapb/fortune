"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "../LangProvider";
import { story, range } from "@/lib/scroll";
import { whatsappLink } from "@/lib/site";
import { hasWebGL, isLowTier, useReducedMotion } from "@/lib/useMotion";
import ArrowIcon from "../ArrowIcon";

gsap.registerPlugin(ScrollTrigger);

const StoryCanvas = dynamic(() => import("../three/StoryCanvas"), { ssr: false });

// Copy windows on the story timeline, aligned with StoryScene's T.
const CHAPTERS: [number, number][] = [
  [0.22, 0.34],
  [0.37, 0.47],
  [0.5, 0.6],
  [0.64, 0.8],
  [0.86, 1.02],
];

function HeroCopy() {
  const { t, lang } = useLang();
  // English is set as three lines; Bangla reads as one sentence and wraps naturally.
  const line = lang === "bn" ? "" : "block";
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-24 sm:px-8 md:justify-center md:pb-0">
      <div className="lg:max-w-[50%]">
        <p className="eyebrow mb-6">{t.hero.eyebrow}</p>
        <h1
          className={`font-display ${lang === "bn" ? "text-[clamp(2rem,5vw,4.5rem)]" : "text-[clamp(2.6rem,7vw,6.75rem)]"} leading-[0.98] font-medium tracking-[-0.045em]`}
        >
          <span className={line}>{t.hero.title1}</span>{" "}
          <span className={`${line} font-light text-brass-grad`}>{t.hero.title2}</span>{" "}
          <span className={line}>{t.hero.title3}</span>
        </h1>
        <p className="mt-6 max-w-md text-base text-ink/75 md:text-lg">{t.hero.sub}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <BookButton variant="ghost" />
        </div>
      </div>
    </div>
  );
}

function BookButton({ className = "", variant = "primary" }: { className?: string; variant?: "primary" | "ghost" }) {
  const { t } = useLang();
  return (
    <a href={whatsappLink(t.bookMsg)} target="_blank" rel="noopener noreferrer" className={`btn-${variant} ${className}`}>
      {t.hero.cta} <ArrowIcon />
    </a>
  );
}

function Chapter({ i, setRef }: { i: number; setRef: (el: HTMLDivElement | null) => void }) {
  const { t } = useLang();
  const c = t.story.chapters[i];
  return (
    <div ref={setRef} className="pointer-events-none absolute inset-0 flex items-end px-4 pb-20 opacity-0 sm:px-8 md:items-center md:pb-0">
      <div className="mx-auto w-full max-w-7xl">
        <div className="glass max-w-md rounded-3xl p-6 md:bg-none md:border-0 md:p-0 md:shadow-none md:backdrop-blur-none">
          <p className="eyebrow mb-4">{c.k}</p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.98] font-medium">{c.t}</h2>
          <p className="mt-4 text-ink/75 md:text-lg">{c.d}</p>
          {i === t.story.chapters.length - 1 && <BookButton className="mt-6" />}
        </div>
      </div>
    </div>
  );
}

/** Hero + "From soil to skyline": one sticky 3D scene scrubbed by scroll. */
export default function Experience() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [active, setActive] = useState(true);
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const chapters = useRef<(HTMLDivElement | null)[]>([]);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced === null) return;
    setMode(!reduced && hasWebGL() ? "3d" : "static");
    setQuality(isLowTier() ? "low" : "high");
  }, [reduced]);

  useEffect(() => {
    if (mode !== "3d" || !section.current) return;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (story.t = self.progress),
    });
    // Only render the 3D scene while the section is on screen.
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(section.current);

    const tick = () => {
      const p = story.t;
      const h = 1 - range(p, 0.04, 0.12);
      if (hero.current) {
        hero.current.style.opacity = String(h);
        hero.current.style.transform = `translateY(${(1 - h) * -60}px)`;
        hero.current.style.pointerEvents = h > 0.5 ? "auto" : "none";
      }
      if (hint.current) hint.current.style.opacity = String(1 - range(p, 0.01, 0.05));
      CHAPTERS.forEach(([a, b], i) => {
        const el = chapters.current[i];
        const o = range(p, a - 0.04, a) * (1 - range(p, b - 0.03, b));
        if (el) {
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 30}px)`;
          // Chapters sit in pointer-events-none layers; only the visible one takes clicks (for its CTA).
          el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        }
        const d = dots.current[i];
        if (d) d.style.background = o > 0.5 ? "var(--color-brass)" : "rgb(238 241 246 / 0.15)";
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      st.kill();
    };
  }, [mode]);

  if (mode === "static") return <StaticStory />;

  return (
    <section ref={section} id="story" className="relative" style={{ height: "700svh" }} aria-label={t.story.label}>
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {mode === "3d" && <StoryCanvas quality={quality} active={active} />}
          {/* soft gradient so copy stays readable over the scene */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-paper/75 via-40% to-transparent md:bg-[linear-gradient(90deg,rgb(10_15_26/0.92)_0%,rgb(10_15_26/0.7)_32%,transparent_58%)]" />
        </div>

        <div ref={hero} className="absolute inset-0">
          <HeroCopy />
        </div>

        {t.story.chapters.map((_, i) => (
          <Chapter key={i} i={i} setRef={(el) => void (chapters.current[i] = el)} />
        ))}

        <div className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-3 md:flex sm:right-8" aria-hidden>
          {CHAPTERS.map((_, i) => (
            <span key={i} ref={(el) => void (dots.current[i] = el)} className="h-8 w-[2px] rounded-full bg-ink/20 transition-colors" />
          ))}
        </div>

        <div ref={hint} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-ink/60 uppercase md:flex">
          {t.hero.scroll}
          <span className="h-10 w-[1px] animate-pulse bg-gradient-to-b from-brass to-transparent" />
        </div>
      </div>
    </section>
  );
}

/** Reduced motion or no WebGL: still image hero + chapters as a list. */
function StaticStory() {
  const { t } = useLang();
  return (
    <>
      <section className="relative h-svh min-h-[640px] overflow-hidden">
        <Image src="/assets/images/tower-sunset.jpg" alt="Fortune Tower at sunset" fill priority className="object-cover object-[70%_center]" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-paper/30 md:bg-gradient-to-r md:from-paper/90 md:via-paper/40 md:to-transparent" />
        <div className="relative h-full">
          <HeroCopy />
        </div>
      </section>
      <section id="story" className="mx-auto max-w-7xl px-4 py-14 sm:px-8 md:py-20">
        <p className="eyebrow mb-10">{t.story.label}</p>
        <ol className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {t.story.chapters.map((c, i) => (
            <li key={c.k} className="border-t border-line pt-6">
              <p className="eyebrow mb-3">{c.k}</p>
              <h3 className="font-display text-2xl">{c.t}</h3>
              <p className="mt-2 text-sm text-ink/70">{c.d}</p>
              {i === t.story.chapters.length - 1 && <BookButton className="mt-4" />}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
