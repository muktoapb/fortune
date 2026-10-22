"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { LangProvider, useLang } from "@/components/LangProvider";
import { LangToggle } from "@/components/Nav";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import { whatsappLink } from "@/lib/site";
import ArrowIcon from "@/components/ArrowIcon";

/** Placeholder until the customer / partner portal (Phase 2) exists. */
function Card() {
  const { t } = useLang();
  return (
    <main className="relative flex min-h-svh flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(212,178,122,0.12),transparent_70%)]" />
      <header className="relative mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label={t.login.back}>
          <Logo />
        </Link>
        <LangToggle />
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4 py-16">
        <div className="glass w-full max-w-md rounded-[2rem] p-8 text-center sm:p-10">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-brass/40 text-brass">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <h1 className="font-display text-4xl font-medium">{t.login.title}</h1>
          <p className="mt-4 text-ink/70">{t.login.body}</p>
          <p className="mt-8 text-sm text-mist">{t.login.help}</p>
          <div className="mt-4 flex flex-col gap-3">
            <a href={whatsappLink(t.waMsg)} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center">
              <WhatsAppIcon className="h-5 w-5" /> {t.cta.whatsapp}
            </a>
          </div>
          <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-brass hover:underline">
            <ArrowIcon dir="left" /> {t.login.back}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginView() {
  return (
    <LangProvider>
      <Card />
    </LangProvider>
  );
}
