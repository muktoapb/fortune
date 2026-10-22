"use client";

import Logo from "./Logo";
import { useLang } from "./LangProvider";
import { WhatsAppIcon } from "./WhatsAppFab";
import { site, whatsappLink } from "@/lib/site";
import ArrowIcon from "./ArrowIcon";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.1H7.7V12h2.7v9.8H14V12h2.7l.4-3.5H14Z" />
    </svg>
  );
}

/** Thin brass skyline: a row of low blocks with Fortune Tower rising in the middle. */
function Skyline() {
  return (
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="h-12 w-full sm:h-16" aria-hidden>
      <defs>
        <linearGradient id="skyFade" x1="0" x2="1">
          <stop offset="0" stopColor="#d4b27a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#d4b27a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#d4b27a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 79 H180 V66 H230 V58 H262 V70 H330 V62 H372 V54 H410 V68 H480 V60 H540 V12 L560 4 L580 12 V79 V60 H640 V66 H700 V52 H742 V64 H800 V58 H860 V70 H920 V62 H968 V68 H1020 V79 H1200"
        fill="none"
        stroke="url(#skyFade)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      {[22, 32, 42, 52, 62].map((y) => (
        <line key={y} x1="546" x2="574" y1={y} y2={y} stroke="#d4b27a" strokeOpacity="0.6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export default function Footer() {
  const { t, num } = useLang();
  const heading = "mb-5 text-[0.7rem] font-semibold tracking-[0.28em] text-mist uppercase";
  const row = "group flex items-center gap-3 text-ink/80 transition-colors hover:text-brass";
  const chip = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-brass transition-colors group-hover:border-brass/60";

  return (
    <footer className="relative mt-10 overflow-hidden">
      <Skyline />
      <div className="bg-gradient-to-b from-cream/40 to-paper">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 pt-14 pb-12 sm:px-8 md:grid-cols-3 lg:grid-cols-[1.4fr_1.2fr_1fr]">
          {/* brand */}
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">{t.footer.tag}</p>
          </div>

          {/* contact */}
          <div>
            <p className={heading}>{t.footer.contact}</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={whatsappLink(t.waMsg)} target="_blank" rel="noopener noreferrer" className={row}>
                  <span className={chip}>
                    <WhatsAppIcon className="h-4 w-4" />
                  </span>
                  {t.cta.whatsapp}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={row}>
                  <span className={chip}>
                    <MailIcon />
                  </span>
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className={row}>
                  <span className={chip}>
                    <FacebookIcon />
                  </span>
                  {t.footer.facebook}
                </a>
              </li>
            </ul>
          </div>

          {/* visit */}
          <div>
            <p className={heading}>{t.footer.visit}</p>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${row} items-start`}>
              <span className={chip}>
                <PinIcon />
              </span>
              <span className="text-sm leading-relaxed">
                {t.footer.address}
                <span className="mt-1 flex items-center gap-1.5 text-brass">
                  {t.location.map} <ArrowIcon dir="up-right" className="h-3.5 w-3.5" />
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-6 text-xs text-mist sm:px-8">
          <p>
            © {num(new Date().getFullYear())} {site.name} · {site.domain} · {t.footer.rights}
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 py-2 transition-colors hover:text-brass">
            {t.footer.top}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform group-hover:-translate-y-0.5 group-hover:border-brass/60">
              <ArrowIcon dir="up" className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>

        {/* giant wordmark */}
        <svg viewBox="0 0 1000 118" className="pointer-events-none block w-full select-none" aria-hidden>
          <defs>
            <linearGradient id="wordFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d4b27a" stopOpacity="0.34" />
              <stop offset="0.6" stopColor="#d4b27a" stopOpacity="0.08" />
              <stop offset="1" stopColor="#d4b27a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text
            x="500"
            y="128"
            textAnchor="middle"
            textLength="984"
            lengthAdjust="spacingAndGlyphs"
            fontSize="150"
            fontWeight="600"
            fill="url(#wordFade)"
            style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.04em" }}
          >
            FORTUNE TOWER
          </text>
        </svg>
      </div>
    </footer>
  );
}
