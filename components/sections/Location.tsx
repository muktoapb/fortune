"use client";

import { useState } from "react";
import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import { destinations, site, universities } from "@/lib/site";
import LocationMap from "../LocationMap";
import ArrowIcon from "../ArrowIcon";

type Key = (typeof destinations)[number]["key"];

export default function Location() {
  const { t, num } = useLang();
  const [hover, setHover] = useState<Key | null>(null);
  const [focus, setFocus] = useState<Key | null>(null);

  const select = (k: Key) => setFocus((f) => (f === k ? null : k));
  const active = hover ?? focus;
  // Once zoomed in, the camera follows whatever is hovered.
  const zoomTo = focus ? active : null;

  return (
    <section id="location" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5">{t.location.label}</p>
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.location.title}</h2>
          <p className="mt-6 max-w-xl text-ink/70">{t.location.body}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Reveal className="relative">
              <div className="relative h-[460px] overflow-hidden rounded-[2rem] border border-line bg-cream sm:h-[580px]">
                <LocationMap active={active} focus={zoomTo} onSelect={select} onHover={setHover} t={t.location} num={num} />
                <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                  {focus && (
                    <button onClick={() => setFocus(null)} className="glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                      <ArrowIcon dir="left" /> {t.location.all}
                    </button>
                  )}
                  <span className="glass rounded-full px-3 py-1.5 text-[0.7rem] text-mist">{t.location.approx}</span>
                </div>
              </div>
          </Reveal>

          <Reveal delay={100}>
            <ul className="glass max-h-[580px] overflow-y-auto rounded-[2rem] p-3" data-lenis-prevent>
              {destinations.map((d) => {
                const on = active === d.key;
                return (
                  <li key={d.key}>
                    <button
                      onMouseEnter={() => setHover(d.key)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(d.key)}
                      onBlur={() => setHover(null)}
                      onClick={() => select(d.key)}
                      aria-pressed={focus === d.key}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${
                        on ? "bg-brass/12" : "hover:bg-ink/5"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm text-ink/85">
                        <span className={`h-2 w-2 shrink-0 rounded-full transition-colors ${on ? "bg-brass" : "bg-ink/25"}`} />
                        {t.location.places[d.key]}
                      </span>
                      <span className="shrink-0 font-display text-2xl text-brass">
                        {num(d.min)}
                        <span className="ml-1 font-sans text-xs text-mist">{t.location.min}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={150} className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow mb-4 !text-ink/60">{t.location.unis}</p>
            <ul className="flex flex-wrap gap-2">
              {universities.map((u) => (
                <li key={u} className="rounded-full border border-line px-4 py-2 text-sm">
                  {u}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            {t.location.map} <ArrowIcon dir="up-right" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
