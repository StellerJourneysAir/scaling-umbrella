// Steller Journeys fleet + perks catalogue (seed data; upserted into Postgres on boot).

export type SeedAircraft = {
  slug: string;
  name: string;
  maker: string;
  kind: "jet" | "helicopter";
  tier: string;
  seats: number;
  rangeKm: number;
  speedKmh: number;
  oneWayUsd: number;
  roundTripUsd: number;
  image: string;
  description: string;
  amenities: string[];
  featured: number;
  sortOrder: number;
};

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

const JET_IMAGES = [
  28919311, 39269837, 37748845, 30115892, 39201212, 31511543, 20640898, 20640947, 20640861,
].map(px);
const HELI_IMAGES = [29756779, 2179612, 35828037, 4263314, 12586757, 14644227].map(px);

const TIER_COPY: Record<string, { text: string; amenities: string[] }> = {
  "Very Light Jet": {
    text: "Agile, efficient and effortlessly chic — ideal for solo executives and couples who want to reach regional airfields the airlines never serve.",
    amenities: ["Leather club seating", "Refreshment centre", "USB-C power at every seat", "Dedicated flight concierge"],
  },
  "Light Jet": {
    text: "A swift, beautifully appointed cabin for short and medium hops, with the privacy of a private lounge at 40,000 feet.",
    amenities: ["Leather club seating", "Enclosed lavatory", "Premium bar & snacks", "Satellite phone", "Dedicated flight concierge"],
  },
  "Midsize Jet": {
    text: "Stand-up comfort, a refined 10-seat cabin and transcontinental reach — the signature Steller Journeys experience.",
    amenities: ["10-seat executive cabin", "Stand-up headroom", "Full galley & bar", "Wi-Fi ready", "Enclosed lavatory", "Dedicated flight concierge"],
  },
  "Super-Midsize Jet": {
    text: "A wide, quiet cabin with true long-range capability and a flat-floor design built for working or unwinding in style.",
    amenities: ["10-seat executive cabin", "Wide-body comfort", "Full galley & bar", "High-speed Wi-Fi ready", "Flight attendant on request", "Dedicated flight concierge"],
  },
  "Heavy Jet": {
    text: "Generous space for larger parties, with private-suite seating, a full galley and the range to cross oceans without a stop.",
    amenities: ["Multi-zone cabin", "Sleeper seating", "Full galley & chef service", "High-speed Wi-Fi", "Flight attendant included", "Dedicated flight concierge"],
  },
  "Ultra-Long-Range Jet": {
    text: "The pinnacle of private aviation: a flagship cabin with bedroom suites, panoramic windows and non-stop intercontinental range.",
    amenities: ["Bedroom suite", "Separate dining & lounge zones", "Shower-ready lavatory", "Starlink high-speed Wi-Fi", "Two flight attendants", "Dedicated flight concierge"],
  },
  "VIP Airliner": {
    text: "A bespoke airliner for delegations and celebrations — private suites, a boardroom and full lounge service for up to 19 guests.",
    amenities: ["Master bedroom suite", "Boardroom & lounge", "Full chef-led galley", "Starlink high-speed Wi-Fi", "Three-person cabin crew", "Dedicated flight concierge"],
  },
  "Light Helicopter": {
    text: "Nimble and exhilarating — skip the traffic and land at the door of your destination, from rooftops to private estates.",
    amenities: ["Panoramic windows", "Noise-cancelling headsets", "Door-to-door landings", "Dedicated flight concierge"],
  },
  "Executive Helicopter": {
    text: "A quiet, air-conditioned cabin with executive seating and city-centre access — the fastest way across any region.",
    amenities: ["Executive leather seating", "Air-conditioned cabin", "Noise-cancelling headsets", "Refreshments on board", "Dedicated flight concierge"],
  },
  "VIP Helicopter": {
    text: "Twin-engine, twin-pilot VIP cabins with club seating and a smooth, quiet ride for up to 12 guests.",
    amenities: ["Twin-engine safety", "Two-pilot crew", "VIP club seating", "Premium bar service", "Air-conditioned cabin", "Dedicated flight concierge"],
  },
  "Heavy Helicopter": {
    text: "The largest rotorcraft in our fleet, for corporate delegations and group charters with all-weather capability.",
    amenities: ["Up to 19 seats", "All-weather IFR capable", "Two-pilot crew", "Premium bar service", "Large baggage hold", "Dedicated flight concierge"],
  },
};

type J = [name: string, maker: string, tier: string, seats: number, rangeKm: number, speedKmh: number, rt: number];

const JETS: J[] = [
  ["HondaJet Elite II", "Honda Aircraft", "Very Light Jet", 5, 2660, 782, 8900],
  ["Citation M2 Gen2", "Cessna", "Very Light Jet", 6, 2700, 748, 9600],
  ["Phenom 100EV", "Embraer", "Very Light Jet", 6, 2200, 720, 9900],
  ["Citation CJ3+", "Cessna", "Light Jet", 7, 3800, 770, 11900],
  ["Citation CJ4 Gen2", "Cessna", "Light Jet", 8, 4000, 835, 14200],
  ["PC-24 Super Versatile Jet", "Pilatus", "Light Jet", 8, 3700, 815, 15100],
  ["Phenom 300E", "Embraer", "Light Jet", 8, 3650, 830, 15800],
  ["Learjet 75 Liberty", "Bombardier", "Light Jet", 8, 3700, 860, 16300],
  // 10-seaters: round-trip $20,000 – $24,000
  ["Hawker 900XP", "Hawker Beechcraft", "Midsize Jet", 10, 4600, 830, 20200],
  ["Citation XLS+", "Cessna", "Midsize Jet", 10, 3700, 815, 20600],
  ["Challenger 300", "Bombardier", "Super-Midsize Jet", 10, 5800, 850, 21000],
  ["Citation Sovereign+", "Cessna", "Super-Midsize Jet", 10, 5500, 830, 21400],
  ["Gulfstream G200", "Gulfstream", "Super-Midsize Jet", 10, 6300, 850, 21900],
  ["Challenger 350", "Bombardier", "Super-Midsize Jet", 10, 5900, 870, 22600],
  ["Falcon 2000S", "Dassault", "Super-Midsize Jet", 10, 6300, 870, 22900],
  ["Praetor 600", "Embraer", "Super-Midsize Jet", 10, 7400, 863, 23200],
  ["Gulfstream G280", "Gulfstream", "Super-Midsize Jet", 10, 6700, 850, 23500],
  ["Falcon 2000LXS", "Dassault", "Super-Midsize Jet", 10, 7500, 870, 23900],
  // Larger cabins
  ["Citation Longitude", "Cessna", "Heavy Jet", 12, 6500, 860, 31500],
  ["Legacy 600", "Embraer", "Heavy Jet", 13, 6300, 830, 36800],
  ["Challenger 650", "Bombardier", "Heavy Jet", 12, 7400, 870, 41500],
  ["Gulfstream G450", "Gulfstream", "Heavy Jet", 14, 8200, 904, 49900],
  ["Falcon 7X", "Dassault", "Ultra-Long-Range Jet", 14, 11000, 900, 58200],
  ["Global 6000", "Bombardier", "Ultra-Long-Range Jet", 14, 11100, 904, 64000],
  ["Gulfstream G550", "Gulfstream", "Ultra-Long-Range Jet", 16, 12500, 904, 76500],
  ["Global 7500", "Bombardier", "Ultra-Long-Range Jet", 19, 14260, 920, 94000],
  ["Gulfstream G700", "Gulfstream", "Ultra-Long-Range Jet", 19, 13890, 920, 112000],
  ["ACJ319neo VIP", "Airbus", "VIP Airliner", 19, 15000, 828, 189000],
];

const HELIS: J[] = [
  ["R44 Raven II", "Robinson", "Light Helicopter", 3, 560, 200, 3400],
  ["R66 Turbine", "Robinson", "Light Helicopter", 4, 650, 215, 4800],
  ["505 Jet Ranger X", "Bell", "Light Helicopter", 4, 560, 230, 5200],
  ["H120", "Airbus", "Light Helicopter", 4, 710, 223, 5600],
  ["480B", "Enstrom", "Light Helicopter", 4, 680, 225, 6100],
  ["H125", "Airbus", "Light Helicopter", 5, 640, 250, 7400],
  ["206L-4 LongRanger", "Bell", "Light Helicopter", 6, 600, 225, 7900],
  ["407GXi", "Bell", "Executive Helicopter", 6, 590, 260, 8300],
  ["H130", "Airbus", "Executive Helicopter", 7, 610, 240, 9200],
  ["MD 902 Explorer", "MD Helicopters", "Executive Helicopter", 7, 600, 250, 9900],
  ["AW119 Koala", "Leonardo", "Executive Helicopter", 7, 880, 265, 11200],
  ["429 GlobalRanger", "Bell", "Executive Helicopter", 7, 710, 278, 11800],
  ["AW09", "Leonardo", "Executive Helicopter", 7, 970, 280, 12600],
  ["AW109 Trekker", "Leonardo", "Executive Helicopter", 7, 930, 285, 13400],
  ["H135", "Airbus", "Executive Helicopter", 7, 620, 254, 14500],
  ["222UT", "Bell", "Executive Helicopter", 8, 650, 260, 14900],
  ["H145", "Airbus", "VIP Helicopter", 9, 680, 246, 17800],
  ["412EPX", "Bell", "VIP Helicopter", 12, 700, 226, 19200],
  ["AW169", "Leonardo", "VIP Helicopter", 10, 800, 296, 23400],
  ["S-76C++", "Sikorsky", "VIP Helicopter", 12, 750, 287, 24500],
  ["H160", "Airbus", "VIP Helicopter", 10, 840, 296, 26200],
  ["S-76D", "Sikorsky", "VIP Helicopter", 12, 780, 287, 27500],
  ["EC155 B1", "Airbus", "VIP Helicopter", 12, 850, 260, 28600],
  ["AW139", "Leonardo", "VIP Helicopter", 12, 1000, 280, 29800],
  ["525 Relentless", "Bell", "Heavy Helicopter", 16, 800, 296, 36500],
  ["H175", "Airbus", "Heavy Helicopter", 16, 850, 290, 38800],
  ["AW189", "Leonardo", "Heavy Helicopter", 16, 1000, 296, 41500],
  ["S-92A", "Sikorsky", "Heavy Helicopter", 19, 1000, 280, 52000],
];

const FEATURED = new Set([
  "Gulfstream G280", "Challenger 350", "Falcon 2000LXS", "Global 7500", "Gulfstream G700",
  "AW139", "H160", "S-76D", "H145",
]);

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function build(list: J[], kind: "jet" | "helicopter", images: string[], offset: number): SeedAircraft[] {
  return list.map(([name, maker, tier, seats, rangeKm, speedKmh, rt], i) => {
    const copy = TIER_COPY[tier];
    const oneWay = Math.round((rt * 0.57) / 50) * 50;
    return {
      slug: slugify(`${maker}-${name}`),
      name: `${maker} ${name}`,
      maker,
      kind,
      tier,
      seats,
      rangeKm,
      speedKmh,
      oneWayUsd: oneWay,
      roundTripUsd: rt,
      image: images[i % images.length],
      description: copy.text,
      amenities: copy.amenities,
      featured: FEATURED.has(name) ? 1 : 0,
      sortOrder: offset + i,
    };
  });
}

export const FLEET: SeedAircraft[] = [
  ...build(JETS, "jet", JET_IMAGES, 0),
  ...build(HELIS, "helicopter", HELI_IMAGES, 1000),
];

export type SeedPerk = { slug: string; name: string; description: string; priceUsd: number; icon: string; sortOrder: number };

export const PERKS: SeedPerk[] = [
  ["champagne", "Champagne & Caviar Reception", "Vintage champagne, Osetra caviar and canapés served on boarding.", 950],
  ["chef", "Private Chef Gourmet Menu", "A multi-course menu by a Michelin-trained chef, plated in-flight.", 1800],
  ["limo", "Chauffeured Luxury Transfer", "Rolls-Royce or Maybach pickup and drop-off, runway-side where permitted.", 650],
  ["wifi", "Starlink High-Speed Wi-Fi", "Gigabit-class connectivity for calls, streaming and video conferences.", 450],
  ["fasttrack", "VIP Terminal & Customs Concierge", "FBO lounge, expedited immigration and customs hand-holding.", 700],
  ["spa", "In-Cabin Wellness Therapist", "Licensed massage and wellness therapist on board for longer sectors.", 1500],
  ["pets", "Pet Travel Suite", "Climate-controlled bedding, vet-grade supplies and documentation support.", 400],
  ["medic", "Onboard Medical Professional", "A registered physician or paramedic travels with your party.", 2400],
  ["security", "Executive Protection Detail", "Discreet close-protection team at both ends of your journey.", 3200],
  ["heli", "Skyline Helicopter Connection", "A city-centre helicopter hop to or from your destination airport.", 2800],
  ["flex", "Anytime Flex Guarantee", "Free change of date or time up to 48 hours before departure.", 1200],
  ["shopping", "Personal Shopper & Hotel Concierge", "Villa, hotel, table and tailored-experience booking at arrival.", 900],
].map(([slug, name, description, priceUsd], i) => ({
  slug: slug as string,
  name: name as string,
  description: description as string,
  priceUsd: priceUsd as number,
  icon: String(i + 1).padStart(2, "0"),
  sortOrder: i,
}));
