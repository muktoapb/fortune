"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useLang } from "../LangProvider";
import Reveal from "../Reveal";
import { WhatsAppIcon } from "../WhatsAppFab";
import { sharesLeft, whatsappLink } from "@/lib/site";

export default function Contact() {
  const { t, num } = useLang();
  const f = t.cta.form;
  const [error, setError] = useState(false);

  // No server: the request opens WhatsApp with a ready-to-send message.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const time = String(data.get("time") ?? "");
    if (!name || !/^[+\d][\d\s-]{6,}$/.test(phone)) {
      setError(true);
      return;
    }
    setError(false);
    const text = `${f.msg}\n\n${f.name}: ${name}\n${f.phone}: ${phone}\n${f.time}: ${time}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full rounded-2xl border border-line bg-paper/60 px-5 py-4 text-ink placeholder:text-mist/70 outline-none transition-colors focus:border-brass";

  return (
    <section id="contact" className="relative overflow-hidden py-14 md:py-20">
      <Image src="/assets/images/tower-sunset.jpg" alt="" fill sizes="100vw" className="object-cover object-[70%_30%] opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/70 to-paper" />

      <div className="relative mx-auto grid grid-cols-1 max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h2 className="font-display text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.95] font-medium">
            {t.cta.title1} <span className="font-light text-brass-grad">{num(sharesLeft)}</span> {t.cta.title2}
          </h2>
          <p className="mt-6 max-w-md text-ink/75 md:text-lg">{t.cta.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={whatsappLink(t.waMsg)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <WhatsAppIcon className="h-5 w-5" /> {t.cta.whatsapp}
            </a>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <form onSubmit={submit} noValidate className="glass space-y-4 rounded-[2rem] p-8">
            <p className="font-display text-3xl">{f.title}</p>
            <label className="block">
              <span className="sr-only">{f.name}</span>
              <input name="name" required autoComplete="name" placeholder={f.name} className={field} />
            </label>
            <label className="block">
              <span className="sr-only">{f.phone}</span>
              <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder={f.phone} className={field} />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm text-mist">{f.time}</legend>
              <div className="flex flex-wrap gap-2">
                {f.times.map((tm, i) => (
                  <label key={tm} className="cursor-pointer">
                    <input type="radio" name="time" value={tm} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-full border border-line px-4 py-2 text-sm transition-colors peer-checked:border-brass peer-checked:bg-brass/15 peer-checked:text-brass peer-focus-visible:outline-2 peer-focus-visible:outline-brass">
                      {tm}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-ember">
                {f.error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full justify-center">
              <WhatsAppIcon className="h-5 w-5" /> {f.send}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
