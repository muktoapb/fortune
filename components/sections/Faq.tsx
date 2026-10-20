"use client";

import { useLang } from "../LangProvider";
import Reveal from "../Reveal";

export default function Faq() {
  const { t } = useLang();
  return (
    <section id="faq" className="relative py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <p className="eyebrow mb-5">{t.faq.label}</p>
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.faq.title}</h2>
        </Reveal>
        <Reveal delay={100}>
          {t.faq.items.map((f, i) => (
            <details key={i} className="group border-b border-line py-6" open={i === 0}>
              <summary className="flex items-center justify-between gap-6 font-display text-2xl md:text-3xl">
                {f.q}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-brass transition-transform duration-500 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-ink/70">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
