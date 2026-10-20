"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useLang } from "./LangProvider";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs" role="group" aria-label="Language">
      {(["en", "bn"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 transition-colors ${lang === l ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
        >
          {l === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}

export default function Nav() {
  const { t } = useLang();
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8" aria-label="Main">
        <a href="#top" aria-label="Fortune Tower — home">
          <Logo />
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <Link href="/login" className="btn-ghost !px-3 !py-2.5 !text-sm sm:!px-4" aria-label={t.nav.login}>
            <UserIcon />
            <span className="hidden sm:inline">{t.nav.login}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
