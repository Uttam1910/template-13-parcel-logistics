import type { Customer, CustomerStatus, CustomerTier } from "./types";

/** Eight fictional shipper accounts. No real company or person is represented. */
export const customers: Customer[] = [
  {
    id: "cus-northfield",
    name: "Northfield Supply Co.",
    slug: "northfield-supply",
    industry: "Industrial supply",
    tier: "enterprise",
    status: "active",
    since: "2021-03-04",
    contact: {
      name: "Rowan Ashby",
      email: "rowan.ashby@northfield.demo",
      phone: "+1 (555) 0164-2210",
    },
    address: { line: "14 Foundry Road", city: "Norwick", region: "north" },
    monthlyVolume: 4820,
    accountManager: "Imani Okafor",
  },
  {
    id: "cus-lumen",
    name: "Lumen Home",
    slug: "lumen-home",
    industry: "Ecommerce — homeware",
    tier: "enterprise",
    status: "active",
    since: "2022-06-19",
    contact: {
      name: "Sasha Vellin",
      email: "sasha.vellin@lumenhome.demo",
      phone: "+1 (555) 0164-2211",
    },
    address: { line: "220 Harrow Street", city: "Aldermere", region: "central" },
    monthlyVolume: 7310,
    accountManager: "Imani Okafor",
  },
  {
    id: "cus-tidewell",
    name: "Tidewell Marine",
    slug: "tidewell-marine",
    industry: "Marine parts",
    tier: "business",
    status: "active",
    since: "2023-01-27",
    contact: {
      name: "Beatriz Salas",
      email: "b.salas@tidewell.demo",
      phone: "+1 (555) 0164-2212",
    },
    address: { line: "3 Kestrel Wharf", city: "Port Kestrel", region: "coastal" },
    monthlyVolume: 1140,
    accountManager: "Devon Marsh",
  },
  {
    id: "cus-orrery",
    name: "Orrery Instruments",
    slug: "orrery-instruments",
    industry: "Precision instruments",
    tier: "business",
    status: "active",
    since: "2022-11-08",
    contact: {
      name: "Nikolai Brandt",
      email: "n.brandt@orrery.demo",
      phone: "+1 (555) 0164-2213",
    },
    address: { line: "77 Meridian Walk", city: "Linthorpe", region: "central" },
    monthlyVolume: 640,
    accountManager: "Devon Marsh",
  },
  {
    id: "cus-fernpost",
    name: "Fernpost Books",
    slug: "fernpost-books",
    industry: "Ecommerce — media",
    tier: "starter",
    status: "active",
    since: "2024-04-15",
    contact: {
      name: "Talia Mendez",
      email: "hello@fernpost.demo",
      phone: "+1 (555) 0164-2214",
    },
    address: { line: "5 Chandler Lane", city: "Vantry", region: "metro" },
    monthlyVolume: 380,
    accountManager: "Priya Raman",
  },
  {
    id: "cus-halcyon",
    name: "Halcyon Labs",
    slug: "halcyon-labs",
    industry: "Life sciences",
    tier: "enterprise",
    status: "active",
    since: "2020-09-02",
    contact: {
      name: "Yusuf Adeyemi",
      email: "logistics@halcyonlabs.demo",
      phone: "+1 (555) 0164-2215",
    },
    address: { line: "1 Beacon Court", city: "Eastmoor", region: "central" },
    monthlyVolume: 2260,
    accountManager: "Imani Okafor",
  },
  {
    id: "cus-mirette",
    name: "Mirette Atelier",
    slug: "mirette-atelier",
    industry: "Retail — apparel",
    tier: "starter",
    status: "onboarding",
    since: "2026-07-28",
    contact: {
      name: "Colette Rune",
      email: "colette@mirette.demo",
      phone: "+1 (555) 0164-2216",
    },
    address: { line: "42 Saltmarket", city: "Kingsmere", region: "metro" },
    monthlyVolume: 90,
    accountManager: "Priya Raman",
  },
  {
    id: "cus-quarrow",
    name: "Quarrow Freight Partners",
    slug: "quarrow-freight",
    industry: "3PL / fulfillment",
    tier: "business",
    status: "paused",
    since: "2023-08-11",
    contact: {
      name: "Idris Kane",
      email: "ops@quarrow.demo",
      phone: "+1 (555) 0164-2217",
    },
    address: { line: "600 Draymouth Approach", city: "Draymouth", region: "international" },
    monthlyVolume: 1520,
    accountManager: "Devon Marsh",
  },
];

const customerById = new Map(customers.map((customer) => [customer.id, customer]));

export function getCustomer(id: string): Customer | undefined {
  return customerById.get(id);
}

export function requireCustomer(id: string): Customer {
  const customer = customerById.get(id);
  if (!customer) throw new Error(`Unknown customer: ${id}`);
  return customer;
}

export const tierLabels: Record<CustomerTier, string> = {
  enterprise: "Enterprise",
  business: "Business",
  starter: "Starter",
};

export const customerStatusLabels: Record<CustomerStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  paused: "Paused",
};
