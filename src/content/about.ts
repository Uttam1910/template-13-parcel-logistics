export const about = {
  eyebrow: "About Parcel",
  headline: "We built the tracking page we kept wishing existed.",
  mission:
    "Parcel is a fictional logistics operator invented for this template. The premise is simple: most shipment tracking tells you a status but not a story. A parcel sits at “in transit” for three days and nobody — not the recipient, not the account manager, not the depot — can say why. Parcel is designed the other way round: every scan carries a place, a facility and a sentence a person can read.",
  principles: [
    {
      title: "One record, two audiences",
      detail:
        "The public tracking page and the internal shipment view read from the same shipment model. What the operations team sees is what the recipient sees, plus the internal notes.",
    },
    {
      title: "Status is never a colour",
      detail:
        "Every status carries a label, a description and an icon. Colour reinforces meaning; it never has to carry it alone.",
    },
    {
      title: "Exceptions are the product",
      detail:
        "Happy-path tracking is easy. The work is in delays, failed attempts and paperwork holds — so those are first-class states with their own treatment, not an error string.",
    },
    {
      title: "Show the route, not a map",
      detail:
        "A shipment moves through named facilities. Drawing that path honestly is more useful than a pin on a map that implies a precision no carrier actually has.",
    },
  ],
  philosophy: {
    title: "How this template is put together",
    body: "Server Components render everything that can be static. The small amount of state that has to survive a reload — theme, demo session, local shipment edits — lives in one typed store backed by browser storage. There is no database, no carrier SDK and no map provider: `src/data` holds the dataset, `src/lib/shipments.ts` is the only place it is read, and that is the seam to replace when you connect a real system.",
    points: [
      "Next.js App Router with typed routes, so a dead internal link fails the build.",
      "Two independently authored themes rather than one inverted palette.",
      "Deterministic SVG for every route, coverage and package illustration — no image requests.",
      "A verification suite covering data integrity, routing, metadata and repository hygiene.",
    ],
  },
  timeline: [
    { year: "2014", event: "Parcel begins as a single crossdock at Sable Ridge." },
    { year: "2017", event: "Aldermere sort center opens and becomes the network's spine." },
    { year: "2020", event: "Metro same-day service launches from the Vantry depot." },
    { year: "2023", event: "Draymouth gateway adds cleared international lanes." },
    { year: "2026", event: "Ten facilities across five regions, all on one tracking model." },
  ],
} as const;
