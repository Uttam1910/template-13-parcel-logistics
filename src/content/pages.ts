/**
 * Page-level copy.
 *
 * Intros, empty-state prose and the short explanatory blocks that sit on a
 * single route live here rather than inside the page components, so the whole
 * public site can be rewritten without opening `src/app`. Longer structured
 * content has its own module: `services.ts`, `solutions.ts`, `coverage.ts`,
 * `about.ts`, `home.ts`.
 */

export type PageIntro = {
  eyebrow: string;
  headline: string;
  body: string;
};

export const trackingPage = {
  intro: {
    eyebrow: "Tracking",
    headline: "Where is my shipment?",
    body: "Enter your tracking number to see the current status, the route through the network, every scan on the way, and proof of delivery once it arrives.",
  } satisfies PageIntro,
  /** Worth stating before someone has a number to try. */
  explains: [
    {
      title: "Status and stage",
      body: "Where the parcel is in the seven-stage lifecycle, and whether anything is holding it up.",
    },
    {
      title: "Route and scans",
      body: "Every facility the parcel has passed through, with a timestamp and a plain-English description.",
    },
    {
      title: "Proof of delivery",
      body: "Who received it, where, how, and the condition it arrived in — once it has been delivered.",
    },
  ],
  notFound: {
    title: "We couldn't find that shipment.",
    /** `{number}` is replaced with the normalised tracking number. */
    body: "No shipment in this demo dataset matches {number}. Numbers look like PKL-10482 — five digits, with or without the prefix. Try one of the demo numbers above.",
    error: "We couldn't find a shipment for “{number}”. Check the number and try again.",
  },
} as const;

export const servicesPage = {
  intro: {
    eyebrow: "Services",
    headline: "Five ways a parcel can move.",
    body: "Each service level changes how a shipment is routed, how often it is scanned and what proof is captured on delivery. Transit windows are typical ranges for the demo network, not guarantees.",
  } satisfies PageIntro,
  closing: {
    eyebrow: "Not sure which service?",
    headline: "Tell us the lanes and the volume.",
    body: "The sales desk can map your traffic onto the right mix of services. This is a demo — no message is sent.",
  },
} as const;

export const solutionsPage = {
  intro: {
    eyebrow: "Solutions",
    headline: "The same record, read five different ways.",
    body: "A buyer wants to know if it arrives tomorrow. A depot wants to know what is stuck. A network lead wants to know whether this week is worse than last. One shipment model answers all three.",
  } satisfies PageIntro,
  closing: {
    eyebrow: "See it working",
    headline: "Open the operations workspace.",
    body: "Filter the board, raise an exception, mark a delivery — and watch the dashboard, timeline and proof of delivery follow.",
  },
} as const;

export const coveragePage = {
  intro: {
    eyebrow: "Coverage",
    headline: "Five regions on one network.",
    body: "Where Parcel operates its own facilities, where it runs on a fixed schedule, and where a partner completes the final leg. All figures below are illustrative demo data.",
  } satisfies PageIntro,
  services: {
    eyebrow: "Service levels",
    headline: "What each region supports.",
    body: "Coverage status determines which services run and how quickly a parcel typically moves.",
  },
  regions: {
    eyebrow: "Regions",
    headline: "Coverage and transit ranges.",
    body: "Transit ranges are typical windows for the demo network — they are not service commitments.",
  },
  facilities: {
    eyebrow: "Facilities",
    headline: "Every node in the demo network.",
    body: "These are the facilities a shipment can route through — the same records the route diagrams draw from.",
  },
  disclaimer:
    "Regions, facilities and volumes are invented for this template. There is no map provider, no geographic data and no real service area.",
} as const;

export const aboutPage = {
  principles: {
    eyebrow: "Operating principles",
    headline: "Four decisions that shaped the product.",
  },
  stats: {
    eyebrow: "Demo statistics",
    headline: "What ships in this template.",
    body: "Not a company's operating figures — the actual size of the dataset you are looking at.",
  },
  disclaimer:
    "is a fictional company invented for this template. No real organisation, person, facility or shipment is represented anywhere in this product.",
} as const;

export const contactPage = {
  intro: {
    eyebrow: "Contact",
    headline: "Tell us what you need to move.",
    body: "Lanes, volume, service mix, returns — the more specific you are, the more useful the first conversation is.",
  } satisfies PageIntro,
  tracking: {
    title: "Chasing a parcel?",
    body: "Tracking answers most delivery questions faster than a message will.",
  },
} as const;

export const loginPage = {
  eyebrow: "Operations workspace",
  headline: "Sign in to Parcel.",
  body: "This is a demo sign-in. Credentials are checked locally in your browser and nothing is sent anywhere.",
} as const;

export const notFoundPage = {
  eyebrow: "Error 404",
  headline: "This page isn’t on the network.",
  body: "The address you followed doesn’t match a route in this template. If you were looking for a shipment, track it by its number instead.",
} as const;

export const workspacePages = {
  dashboard: {
    eyebrow: "Operations",
    title: "Dashboard",
    description:
      "Everything currently moving through the network, computed from the shipment records themselves.",
  },
  shipments: {
    eyebrow: "Operations",
    title: "Shipments",
    description:
      "The whole board. Filters live in the URL, so a view is shareable and survives a reload.",
  },
  customers: {
    eyebrow: "Accounts",
    title: "Customers",
    description:
      "Eight demo shipper accounts. Open one to see its shipment history and delivery performance.",
  },
  analytics: {
    eyebrow: "Reporting",
    title: "Analytics",
    description:
      "Network performance across four ranges. Changing the range re-buckets and regenerates every series.",
  },
  settings: {
    eyebrow: "Workspace",
    title: "Settings",
    description:
      "Everything here is stored in this browser. The appearance control drives the real theme system.",
  },
} as const;
