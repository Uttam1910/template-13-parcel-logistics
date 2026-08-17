export type SolutionContent = {
  id: string;
  name: string;
  headline: string;
  description: string;
  /** What Parcel does for this kind of operation. */
  capabilities: { title: string; detail: string }[];
  metric: { value: string; label: string };
};

export const solutions: SolutionContent[] = [
  {
    id: "ecommerce",
    name: "Ecommerce",
    headline: "Post-purchase visibility that stops the “where is it?” email.",
    description:
      "Give buyers a tracking page that explains itself. Every scan carries a location, a facility and a plain-English description, so a delay reads as an explanation rather than a silence.",
    capabilities: [
      {
        title: "Branded tracking page",
        detail: "One public URL per shipment, readable on a phone and safe to share.",
      },
      {
        title: "Exception surfacing",
        detail:
          "Failed attempts and address problems appear on the timeline, not just in a log.",
      },
      {
        title: "Proof of delivery",
        detail: "Recipient, method and package condition captured against the shipment record.",
      },
    ],
    metric: { value: "7", label: "Lifecycle stages tracked per parcel" },
  },
  {
    id: "retail",
    name: "Retail",
    headline: "Replenishment you can plan a shift around.",
    description:
      "Store teams need to know what lands before the doors open. Filter the board by destination, watch the out-for-delivery queue, and see which consignments moved to a later slot.",
    capabilities: [
      {
        title: "Destination filtering",
        detail: "Search the shipment board by store, city or destination facility.",
      },
      {
        title: "Delivery windows",
        detail:
          "Estimated delivery on every record, with delays flagged separately from exceptions.",
      },
      {
        title: "Multi-piece handling",
        detail: "Piece counts and weights tracked per shipment rather than per label.",
      },
    ],
    metric: { value: "5", label: "Regions in the demo network" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    headline: "One operational picture across every account.",
    description:
      "The operations workspace consolidates active volume, exceptions and on-time performance so a network lead can see the day without opening five systems.",
    capabilities: [
      {
        title: "Network dashboard",
        detail:
          "Active, in-transit, out-for-delivery, delivered and exception counts in one view.",
      },
      {
        title: "Account performance",
        detail: "Delivered and exception totals rolled up per customer.",
      },
      {
        title: "Analytics ranges",
        detail: "Volume, on-time rate and transit time across 7D, 30D, 90D and year to date.",
      },
    ],
    metric: { value: "6", label: "Operating metrics on the dashboard" },
  },
  {
    id: "fulfillment",
    name: "Fulfillment",
    headline: "Built for the people scanning the labels.",
    description:
      "Fulfilment teams work the exception queue, not the happy path. Parcel puts status changes, delay flags and internal notes on the shipment itself, where the next person will find them.",
    capabilities: [
      {
        title: "Status actions",
        detail: "Advance a stage, flag a delay, raise an exception or complete delivery.",
      },
      {
        title: "Internal notes",
        detail: "Operational context kept beside the shipment and out of the customer's view.",
      },
      {
        title: "Facility routing",
        detail: "Every shipment carries its full facility path, origin to destination.",
      },
    ],
    metric: { value: "10", label: "Facilities on the routing graph" },
  },
  {
    id: "returns",
    name: "Returns",
    headline: "Reverse flow treated as a first-class shipment.",
    description:
      "A return is a shipment that happens to be going the other way. It gets the same lifecycle, the same timeline and the same proof of receipt — including the condition the parcel arrived in.",
    capabilities: [
      {
        title: "Returns service level",
        detail: "Collection from the recipient to a nominated returns hub.",
      },
      {
        title: "Condition recording",
        detail: "Good, minor damage or damaged captured at the point of receipt.",
      },
      {
        title: "Returns analytics",
        detail: "Return volume tracked alongside exceptions across every range.",
      },
    ],
    metric: { value: "4", label: "Analytics ranges, all of them live" },
  },
];
