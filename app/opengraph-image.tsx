import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { sharesLeft, site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fortune Tower at sunset — G+9 residence in Birulia, Dhaka";

// Link-preview card (Facebook, WhatsApp, X, LinkedIn): brand panel + tower photo at the 1.91:1 ratio they expect.
export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/assets/images/tower-sunset.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const lakh = (site.sharePrice + site.registrationFee) / 100000;
  const brass = "#d4b27a";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0f1a", color: "#eef1f6" }}>
        <div style={{ width: 600, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <path d="M20 54V18l12-7 12 7v36" fill="none" stroke={brass} strokeWidth="3.2" strokeLinejoin="round" />
              <line x1="25" x2="39" y1="24" y2="24" stroke={brass} strokeWidth="2.4" strokeLinecap="round" />
              <line x1="25" x2="39" y1="30" y2="30" stroke={brass} strokeWidth="2.4" strokeLinecap="round" />
              <line x1="25" x2="39" y1="36" y2="36" stroke={brass} strokeWidth="2.4" strokeLinecap="round" />
              <line x1="25" x2="39" y1="42" y2="42" stroke={brass} strokeWidth="2.4" strokeLinecap="round" />
              <rect x="28.5" y="47" width="7" height="7" rx="1" fill={brass} />
            </svg>
            <div style={{ fontSize: 26, letterSpacing: 6, color: brass }}>FORTUNE TOWER</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05 }}>Own a share of</div>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: brass }}>Fortune Tower</div>
            <div style={{ marginTop: 22, fontSize: 28, color: "#93a0b4" }}>{`G+${site.floors} residence · Kakab, Birulia, Savar`}</div>
            <div style={{ marginTop: 8, fontSize: 28, color: "#93a0b4" }}>
              {`${site.totalShares} flats · ${site.flatSqft.toLocaleString("en-US")} sq ft · 3 bed`}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", background: "#ec6a43", color: "#fff", fontSize: 26, fontWeight: 700, padding: "10px 22px", borderRadius: 999, flexShrink: 0 }}>
              {`${sharesLeft} shares left`}
            </div>
            <div style={{ fontSize: 22, whiteSpace: "nowrap" }}>{`BDT ${lakh} lakh with registration`}</div>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={600} height={630} alt="" style={{ objectFit: "cover", objectPosition: "center 30%" }} />
      </div>
    ),
    size,
  );
}
