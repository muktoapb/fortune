import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon: same mark as app/icon.svg on a full-bleed square (iOS rounds the corners).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f1a" }}>
        <svg width="130" height="130" viewBox="0 0 64 64">
          <path d="M20 54V18l12-7 12 7v36" fill="none" stroke="#d4b27a" strokeWidth="3.2" strokeLinejoin="round" />
          <line x1="25" x2="39" y1="24" y2="24" stroke="#d4b27a" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="25" x2="39" y1="30" y2="30" stroke="#d4b27a" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="25" x2="39" y1="36" y2="36" stroke="#d4b27a" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="25" x2="39" y1="42" y2="42" stroke="#d4b27a" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="28.5" y="47" width="7" height="7" rx="1" fill="#d4b27a" />
        </svg>
      </div>
    ),
    size,
  );
}
