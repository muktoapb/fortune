import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, Hind_Siliguri, Anek_Bangla } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], variable: "--font-hind" });
const anek = Anek_Bangla({ subsets: ["bengali", "latin"], variable: "--font-anek" });

const title = "Fortune Tower — G+9 Residence in Birulia, Dhaka";
const description =
  "Own a land share in Fortune Tower: 36 modern 3-bed flats on a 12.06-decimal corner plot in Kakab, Birulia, Savar. Only a few shares left — BDT 6.2 lakh with registration.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    images: [{ url: "/assets/images/tower-sunset.jpg", width: 1024, height: 1024, alt: "Fortune Tower at sunset" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/images/tower-sunset.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0a0f1a", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ApartmentComplex",
  name: site.name,
  url: site.url,
  description,
  image: `${site.url}/assets/images/tower-sunset.jpg`,
  email: site.email,
  numberOfAccommodationUnits: site.totalShares,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kakab, Birulia",
    addressLocality: "Savar",
    addressRegion: "Dhaka",
    addressCountry: "BD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} ${hind.variable} ${anek.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
