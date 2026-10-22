"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import { WhatsAppIcon } from "../WhatsAppFab";
import { whatsappLink } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

type Status = "done" | "now" | "next";

function Node({ status }: { status: Status }) {
  if (status === "done")
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#f0dcab] to-brass-bright text-paper shadow-[0_0_24px_-4px_rgb(212_178_122/0.7)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
    );
  if (status === "now")
    return (
      <span className="pulse-ember flex h-9 w-9 items-center justify-center rounded-full border-2 border-ember bg-paper">
        <span className="h-3 w-3 rounded-full bg-ember" />
      </span>
    );
  return <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-ink/25 bg-paper" />;
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export default function Trust() {
  const { t, num } = useLang();
  const j = t.trust.journey;
  const steps = t.trust.steps as { t: string; s: Status; d: string }[];
  const done = steps.filter((s) => s.s === "done").length;
  const nowIndex = steps.findIndex((s) => s.s === "now");

  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);

  // The brass line grows with scroll, but never past "We are here".
  useEffect(() => {
    const el = list.current;
    const line = fill.current;
    if (!el || !line) return;
    const stopAt = () => {
      const n = nodes.current[nowIndex >= 0 ? nowIndex : steps.length - 1];
      // node sits inside its <li>; add the row's offset within the list
      return n ? (n.parentElement?.offsetTop ?? 0) + n.offsetTop + n.offsetHeight / 2 : el.offsetHeight;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      line.style.height = `${stopAt()}px`;
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 60%",
      onUpdate: (self) => (line.style.height = `${Math.min(self.progress * el.offsetHeight, stopAt())}px`),
    });
    return () => st.kill();
  }, [nowIndex, steps.length]);

  // Documents panel: under the summary on desktop, after the timeline on phones.
  const docs = (className: string) => (
    <Reveal delay={200} className={`glass rounded-[1.75rem] p-6 ${className}`}>
      <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.24em] text-mist uppercase">{j.docsTitle}</p>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {j.docs.map((d) => (
          <li key={d} className="flex items-center gap-2.5 text-sm text-ink/85">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-brass">
              <DocIcon />
            </span>
            {d}
          </li>
        ))}
      </ul>
      <a href={whatsappLink(j.askMsg)} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-6 w-full justify-center !text-sm">
        <WhatsAppIcon className="h-4 w-4 text-[#25d366]" /> {j.ask}
      </a>
    </Reveal>
  );

  return (
    <section id="trust" className="relative py-14 md:py-20">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-14 px-4 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {/* summary (sticky on desktop) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="eyebrow mb-5">{t.trust.label}</p>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.trust.title}</h2>
            <p className="mt-6 max-w-md text-ink/70 md:text-lg">{t.trust.body}</p>
          </Reveal>

          <Reveal delay={100} className="mt-10">
            <p className="flex items-baseline gap-3">
              <span className="font-display text-6xl font-medium text-brass-grad">
                {num(done)}
                <span className="text-3xl text-mist">/{num(steps.length)}</span>
              </span>
              <span className="text-sm text-ink/70">{j.complete}</span>
            </p>
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${s.s === "done" ? "bg-brass" : s.s === "now" ? "pulse-ember bg-ember" : "bg-ink/10"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-mist">{j.updated}</p>
          </Reveal>

          {docs("mt-10 hidden lg:block")}
        </div>

        {/* journey */}
        <ol ref={list} className="relative">
          {/* track + scroll fill */}
          <span className="absolute top-4 bottom-4 left-[17px] w-0.5 border-l-2 border-dashed border-ink/15" aria-hidden />
          <span
            ref={fill}
            className="absolute top-0 left-[17px] w-0.5 rounded-full bg-gradient-to-b from-brass via-brass to-ember shadow-[0_0_14px_rgb(212_178_122/0.6)]"
            style={{ height: 0 }}
            aria-hidden
          />
          {steps.map((s, i) => {
            const now = s.s === "now";
            return (
              <li key={s.t} className="relative pb-8 pl-16 last:pb-0">
                <span ref={(el) => void (nodes.current[i] = el)} className="absolute top-3 left-0 z-10">
                  <Node status={s.s} />
                </span>
                <Reveal delay={i * 60}>
                  <div
                    className={`rounded-[1.5rem] border p-5 sm:p-6 ${
                      now
                        ? "border-ember/40 bg-gradient-to-br from-ember/10 via-cream to-cream shadow-[0_30px_60px_-30px_rgb(236_106_67/0.45)]"
                        : s.s === "done"
                          ? "border-line bg-cream/70"
                          : "border-line/60 bg-transparent"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-mist uppercase">
                        {j.phase} {num(String(i + 1).padStart(2, "0"))}
                      </span>
                      {now ? (
                        <span className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white">{j.here}</span>
                      ) : (
                        <span className={`text-xs font-medium ${s.s === "done" ? "text-brass" : "text-mist"}`}>{j.status[s.s]}</span>
                      )}
                    </div>
                    <h3 className={`mt-2 font-display text-2xl font-medium sm:text-3xl ${s.s === "next" ? "text-ink/60" : ""}`}>{s.t}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${s.s === "next" ? "text-mist" : "text-ink/75"}`}>{s.d}</p>
                    {now && <p className="mt-3 text-xs font-medium text-ember">{j.status.now}</p>}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>

        {docs("lg:hidden")}
      </div>
    </section>
  );
}
