"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import { bdt, site, sharesLeft, whatsappLink } from "@/lib/site";
import { hasWebGL, useReducedMotion } from "@/lib/useMotion";
import ArrowIcon from "../ArrowIcon";

const ShareScene = dynamic(() => import("../three/ShareScene"), { ssr: false });

/** 36 land shares: 30 lock as sold, 6 stay open. Shares are not tied to specific flats. */
export default function Shares() {
  const { t, num } = useLang();
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const locked = useMemo(() => ({ v: 0 }), []);
  const root = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => setWebgl(hasWebGL()), []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || played.current || reduced === null) return;
    played.current = true;
    if (reduced) {
      locked.v = site.sharesSold;
      setCount(site.sharesSold);
      return;
    }
    gsap.to(locked, {
      v: site.sharesSold,
      duration: 2.6,
      ease: "power2.inOut",
      delay: 0.3,
      onUpdate: () => setCount(Math.round(locked.v)),
    });
  }, [inView, reduced, locked]);

  const pct = count / site.totalShares;
  const R = 54;
  const C = 2 * Math.PI * R;
  const info =
    hovered === null
      ? null
      : {
          sold: hovered < site.sharesSold,
          n: hovered + 1,
        };

  return (
    <section ref={root} id="shares" className="relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_50%,rgba(194,163,107,0.12),transparent_70%)]" />
      <div className="relative mx-auto grid grid-cols-1 max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Reveal>
            <p className="eyebrow mb-5">{t.shares.label}</p>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.shares.title}</h2>
            <p className="mt-6 max-w-lg text-ink/70 md:text-lg">{t.shares.body}</p>
          </Reveal>

          <Reveal delay={150} className="mt-10 flex items-center gap-7">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
                <circle cx="64" cy="64" r={R} fill="none" stroke="rgb(238 241 246 / 0.08)" strokeWidth="8" />
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke="url(#ring)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                />
                <defs>
                  <linearGradient id="ring" x1="0" x2="1">
                    <stop offset="0" stopColor="#f3dfb0" />
                    <stop offset="1" stopColor="#ec6a43" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl leading-none">{num(count)}</span>
                <span className="text-xs text-mist">
                  {t.shares.of} {num(site.totalShares)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-ink/80" aria-live="polite">
                <b className="text-ink">{num(site.sharesSold)}</b> {t.shares.sharesSold}
              </p>
              <p className="mt-1 font-display text-4xl text-available">
                {num(sharesLeft)} <span className="text-2xl">{t.hero.left}</span>
              </p>
              <div className="mt-3 flex gap-4 text-xs text-mist">
                <span className="flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-sold" /> {t.shares.sold}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-available" /> {t.shares.available}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={250} className="mt-10">
            <a href={whatsappLink(t.bookMsg)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {t.shares.cta} {num(sharesLeft)} <ArrowIcon />
            </a>
          </Reveal>
        </div>

        <Reveal delay={100} className="relative">
          <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-cream to-sand md:aspect-[5/4]">
            {webgl ? (
              <ShareScene locked={locked} hovered={hovered} onHover={setHovered} active={inView} />
            ) : (
              <FlatGrid count={count} />
            )}
            <p className="pointer-events-none absolute top-5 left-6 text-xs tracking-widest text-mist uppercase">{t.shares.ghost}</p>
            <div className="glass pointer-events-none absolute right-4 bottom-4 left-4 rounded-2xl px-5 py-4 text-sm sm:right-auto sm:min-w-72">
              {info ? (
                <div className="flex items-center gap-4">
                  <span className={`h-3 w-3 rounded-sm ${info.sold ? "bg-sold" : "bg-available"}`} />
                  <div>
                    <p className="font-semibold">
                      {t.shares.tile} · {info.sold ? t.shares.sold : t.shares.available}
                    </p>
                    <p className="text-mist">
                      {num(site.shareDecimal)} {t.shares.decimal} · BDT {num(bdt(site.sharePrice + site.registrationFee))}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-mist">{t.shares.hint}</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FlatGrid({ count }: { count: number }) {
  return (
    <div className="grid h-full grid-cols-6 gap-2 p-10" aria-hidden>
      {Array.from({ length: site.totalShares }, (_, i) => (
        <div key={i} className={`rounded-md ${i < count ? "bg-sold/60" : count >= site.sharesSold ? "bg-available/70" : "bg-ink/10"}`} />
      ))}
    </div>
  );
}
