import type { Facility, RegionId } from "./types";

/**
 * The Parcel network — ten fictional facilities.
 *
 * `point` is an abstract coordinate inside a 0–100 square used by the route and
 * coverage artwork. It is not geographic data and is never presented as a map.
 */
export const facilities: Facility[] = [
  {
    id: "fac-nwk",
    code: "NWK",
    name: "Norwick Gateway",
    city: "Norwick",
    region: "north",
    kind: "gateway",
    point: { x: 30, y: 12 },
    dailyVolume: 41200,
  },
  {
    id: "fac-sbr",
    code: "SBR",
    name: "Sable Ridge Crossdock",
    city: "Sable Ridge",
    region: "north",
    kind: "crossdock",
    point: { x: 58, y: 20 },
    dailyVolume: 18600,
  },
  {
    id: "fac-ald",
    code: "ALD",
    name: "Aldermere Sort Center",
    city: "Aldermere",
    region: "central",
    kind: "sort_center",
    point: { x: 44, y: 40 },
    dailyVolume: 96400,
  },
  {
    id: "fac-lnt",
    code: "LNT",
    name: "Linthorpe Regional Hub",
    city: "Linthorpe",
    region: "central",
    kind: "regional_hub",
    point: { x: 68, y: 46 },
    dailyVolume: 52800,
  },
  {
    id: "fac-emr",
    code: "EMR",
    name: "Eastmoor Delivery Station",
    city: "Eastmoor",
    region: "central",
    kind: "delivery_station",
    point: { x: 82, y: 38 },
    dailyVolume: 14300,
  },
  {
    id: "fac-vnt",
    code: "VNT",
    name: "Vantry Metro Depot",
    city: "Vantry",
    region: "metro",
    kind: "regional_hub",
    point: { x: 36, y: 62 },
    dailyVolume: 73900,
  },
  {
    id: "fac-kgm",
    code: "KGM",
    name: "Kingsmere Delivery Station",
    city: "Kingsmere",
    region: "metro",
    kind: "delivery_station",
    point: { x: 52, y: 72 },
    dailyVolume: 21500,
  },
  {
    id: "fac-pkl",
    code: "PKL",
    name: "Port Kestrel Freight Terminal",
    city: "Port Kestrel",
    region: "coastal",
    kind: "freight_terminal",
    point: { x: 16, y: 74 },
    dailyVolume: 33100,
  },
  {
    id: "fac-cby",
    code: "CBY",
    name: "Calder Bay Delivery Station",
    city: "Calder Bay",
    region: "coastal",
    kind: "delivery_station",
    point: { x: 24, y: 88 },
    dailyVolume: 9700,
  },
  {
    id: "fac-dry",
    code: "DRY",
    name: "Draymouth International Gateway",
    city: "Draymouth",
    region: "international",
    kind: "gateway",
    point: { x: 88, y: 76 },
    dailyVolume: 28400,
  },
];

const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));

export function getFacility(id: string): Facility | undefined {
  return facilityById.get(id);
}

/** Throws for unknown ids — used where the dataset guarantees the reference exists. */
export function requireFacility(id: string): Facility {
  const facility = facilityById.get(id);
  if (!facility) throw new Error(`Unknown facility: ${id}`);
  return facility;
}

export const facilityKindLabels: Record<Facility["kind"], string> = {
  gateway: "Gateway",
  sort_center: "Sort center",
  regional_hub: "Regional hub",
  delivery_station: "Delivery station",
  crossdock: "Crossdock",
  freight_terminal: "Freight terminal",
};

export const regionLabels: Record<RegionId, string> = {
  north: "North",
  central: "Central",
  coastal: "Coastal",
  metro: "Metro",
  international: "International",
};
