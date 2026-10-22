"use client";

import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import { bdt, site } from "@/lib/site";

export default function Price() {
  const { t, num } = useLang();
  const shareTotal = site.sharePrice + site.registrationFee;
  const [c1, c2] = site.constructionLakh;
  const [f1, f2] = site.totalFlatLakh;
  // bar proportions against the upper flat estimate
  const max = f2 * 100000;
  const w = (n: number) => `${(n / max) * 100}%`;

  const steps = [
    { amount: `৳ ${num(bdt(site.bookingAmount))}`, ...t.price.steps[0] },
    { amount: `৳ ${num(bdt(site.beforeRegistrationAmount))} + ${num(bdt(site.registrationFee))}`, ...t.price.steps[1] },
    { amount: `৳ ${num(c1)}–${num(c2)} ${t.price.lakh}`, ...t.price.steps[2] },
  ];

  return (
    <section id="price" className="relative py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_20%_40%,rgba(212,178,122,0.06),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-5">{t.price.label}</p>
          <h2 className="max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.98] font-medium">{t.price.title}</h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="glass rounded-[2rem] p-8 lg:col-span-2">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-mist">{t.price.share}</dt>
                <dd className="mt-1 font-display text-4xl">৳ {num(bdt(site.sharePrice))}</dd>
              </div>
              <div>
                <dt className="text-sm text-mist">+ {t.price.reg}</dt>
                <dd className="mt-1 font-display text-4xl">৳ {num(bdt(site.registrationFee))}</dd>
              </div>
              <div>
                <dt className="text-sm text-brass">= {t.price.total}</dt>
                <dd className="mt-1 font-display text-4xl text-brass-grad">৳ {num(bdt(shareTotal))}</dd>
              </div>
            </dl>

            <div className="mt-10">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-ink/5">
                <span className="h-full bg-gradient-to-r from-brass-soft to-brass" style={{ width: w(site.sharePrice) }} />
                <span className="h-full bg-brass-soft" style={{ width: w(site.registrationFee) }} />
                <span
                  className="h-full bg-[repeating-linear-gradient(45deg,rgba(238,241,246,.18)_0_6px,rgba(238,241,246,.06)_6px_12px)]"
                  style={{ width: w(c2 * 100000) }}
                />
              </div>
              <div className="mt-4 flex flex-wrap justify-between gap-4 text-sm">
                <span className="text-mist">
                  {t.price.construction}: <b className="text-ink">৳ {num(c1)}–{num(c2)} {t.price.lakh}</b>
                </span>
                <span>
                  {t.price.flat}: <b className="font-display text-2xl text-brass-grad">৳ {num(f1)}–{num(f2)} {t.price.lakh}</b>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="rounded-[2rem] border border-brass/30 bg-gradient-to-b from-sand to-cream p-8">
            <p className="eyebrow mb-6">{t.price.stepsTitle}</p>
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass font-display text-brass">
                    {num(i + 1)}
                  </span>
                  <div>
                    <p className="font-semibold">{s.t}</p>
                    <p className="font-display text-2xl text-brass">{s.amount}</p>
                    <p className="text-sm text-mist">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
