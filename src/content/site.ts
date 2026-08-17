/**
 * Site-wide configuration and company copy.
 *
 * Parcel is a fictional logistics operator invented for this template. Every
 * address, phone number, email and figure below is demo content.
 */
export const siteConfig = {
  name: "Parcel",
  tagline: "Logistics, without the guesswork.",
  description:
    "Parcel is a shipment tracking and delivery operations platform: public parcel tracking, a live route view, proof of delivery and a compact operations workspace. This is a demo environment — no carrier, tracking API or map provider is connected.",
  shortDescription:
    "Shipment tracking and delivery operations — public tracking, route visibility and a compact ops workspace.",
  locale: "en_US",
  company: {
    legalName: "Parcel Logistics Group (demo)",
    founded: 2014,
    headquarters: "Aldermere Sort Center, Central",
    contact: {
      email: "hello@parcel.demo",
      support: "support@parcel.demo",
      sales: "sales@parcel.demo",
      phone: "+1 (555) 0164-2200",
      hours: "Support desk, Mon–Sat 07:00 – 21:00",
    },
    office: {
      name: "Parcel Network Control",
      address: "1 Manifest Way, Aldermere",
      region: "Central",
    },
  },
  /** Illustrative network figures shown on the marketing site. */
  stats: [
    {
      value: "10",
      label: "Facilities",
      detail: "Gateways, sort centers and delivery stations",
    },
    { value: "1.8k", label: "Parcels per day", detail: "Average network throughput" },
    { value: "96.4%", label: "On-time rate", detail: "Rolling ninety-day average" },
    { value: "5", label: "Regions", detail: "North, Central, Coastal, Metro, International" },
  ],
} as const;

/** Wording used wherever the demo boundary needs to be explicit. */
export const demoNotices = {
  tracking: "Demo tracking — no live carrier data.",
  route: "Demo route visualization — not a map, and not GPS.",
  pod: "Demo proof of delivery.",
  coverage: "Illustrative coverage — demo regions and transit ranges.",
  shipmentCreated: "Demo environment — no real shipment was created.",
  account: "Demo environment — no real account is created.",
  form: "This is a template demo. No message was sent.",
  workspace: "Demo workspace — changes are stored in this browser only.",
} as const;
