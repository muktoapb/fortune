const ROTATE = { right: 0, "up-right": -45, up: -90, left: 180 } as const;

/** Line arrow used on buttons and links; one shape rotated per direction. */
export default function ArrowIcon({ dir = "right", className = "h-4 w-4" }: { dir?: keyof typeof ROTATE; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      style={{ transform: `rotate(${ROTATE[dir]}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
