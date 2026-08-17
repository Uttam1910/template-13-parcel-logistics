import type { User } from "./types";

/**
 * Demo operators. Sign-in is local-only: no credentials leave the browser and
 * no account is created anywhere. See `src/lib/demo/store.tsx`.
 */
export const users: User[] = [
  {
    id: "usr-imani",
    name: "Imani Okafor",
    email: "imani.okafor@parcel.demo",
    role: "Network Operations Lead",
    initials: "IO",
    facilityId: "fac-ald",
  },
  {
    id: "usr-devon",
    name: "Devon Marsh",
    email: "devon.marsh@parcel.demo",
    role: "Freight & Exceptions",
    initials: "DM",
    facilityId: "fac-dry",
  },
  {
    id: "usr-priya",
    name: "Priya Raman",
    email: "priya.raman@parcel.demo",
    role: "Metro Dispatch",
    initials: "PR",
    facilityId: "fac-vnt",
  },
];

/** The operator the demo signs in as. Fictional credentials, checked locally. */
export const demoAccount = {
  user: users[0],
  email: "ops@parcel.demo",
  password: "parcel-demo",
} as const;
