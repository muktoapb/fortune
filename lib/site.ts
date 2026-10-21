// Single source of truth for project facts. Update numbers here only.

export const site = {
  name: "Fortune Tower",
  domain: "fortunetower.info",
  url: "https://fortunetower.info",
  whatsapp: "8801776677727",
  email: "contact@fortunetower.info",
  facebook: "https://www.facebook.com/fortunetowerbd",
  mapsUrl: "https://maps.app.goo.gl/soU6nXJkmAA8v6cg6",

  floors: 9, // residential floors above ground (G+9)
  unitsPerFloor: 4,
  totalShares: 36,
  sharesSold: 30,

  landDecimal: 12.06,
  shareDecimal: 0.335,
  flatSqft: 1313, // including parking

  sharePrice: 600000,
  registrationFee: 20000,
  bookingAmount: 100000,
  beforeRegistrationAmount: 500000,
  constructionLakh: [23, 24],
  totalFlatLakh: [29, 30],
  handoverYear: 2030,
} as const;

export const sharesLeft = site.totalShares - site.sharesSold;

// Minutes by road from the plot.
export const destinations = [
  { key: "ringRoad", min: 5 },
  { key: "birulia", min: 5 },
  { key: "sector18", min: 8 },
  { key: "navy", min: 10 },
  { key: "metro", min: 11 },
  { key: "mirpurDohs", min: 15 },
  { key: "mirpur12", min: 16 },
  { key: "mirpur11", min: 18 },
  { key: "airport", min: 18 },
  { key: "ecb", min: 20 },
  { key: "azampur", min: 20 },
  { key: "abdullahpur", min: 22 },
] as const;

export const universities = ["BRAC", "City", "Manarat", "Eastern", "Ahsanullah Mission", "Daffodil"];

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

const bnDigits = "০১২৩৪৫৬৭৮৯";
export const toBn = (s: string | number) => String(s).replace(/\d/g, (d) => bnDigits[+d]);

// South-Asian grouping: 6,20,000
export const bdt = (n: number) => n.toLocaleString("en-IN");
