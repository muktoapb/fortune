/** Fortune Tower wordmark: a stylised tower glyph + name. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 28 36" className="h-8 w-auto" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3dfb0" />
            <stop offset="1" stopColor="#b8893d" />
          </linearGradient>
        </defs>
        <path d="M5 35V6l9-5 9 5v29" fill="none" stroke="url(#lg)" strokeWidth="1.6" />
        {[10, 14, 18, 22, 26].map((y) => (
          <line key={y} x1="8" x2="20" y1={y} y2={y} stroke="url(#lg)" strokeWidth="1.2" />
        ))}
        <rect x="11.5" y="29" width="5" height="6" fill="url(#lg)" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[1.35rem] font-semibold tracking-[0.18em]">FORTUNE</span>
        <span className="block text-[0.6rem] tracking-[0.62em] text-brass">TOWER</span>
      </span>
    </span>
  );
}
