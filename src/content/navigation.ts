import type { Route } from "next";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  PackageSearch,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: Route; label: string };
export type AppNavItem = NavItem & { icon: LucideIcon; description: string };

/** Public marketing + tracking navigation. */
export const publicNav: NavItem[] = [
  { href: "/tracking", label: "Tracking" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/coverage", label: "Coverage" },
  { href: "/about", label: "About" },
];

/** Operations workspace navigation. */
export const appNav: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Network status at a glance",
  },
  {
    href: "/shipments",
    label: "Shipments",
    icon: PackageSearch,
    description: "Search, filter and act on shipments",
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Building2,
    description: "Accounts and delivery performance",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Volume, on-time rate and exceptions",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Profile, notifications and appearance",
  },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Track",
    links: [
      { href: "/tracking", label: "Track a shipment" },
      { href: "/coverage", label: "Coverage & transit times" },
      { href: "/services", label: "Service levels" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions", label: "All solutions" },
      { href: "/services", label: "Freight" },
      { href: "/services", label: "Returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Parcel" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Demo workspace",
    links: [
      { href: "/dashboard", label: "Operations dashboard" },
      { href: "/shipments", label: "Shipments" },
      { href: "/analytics", label: "Analytics" },
    ],
  },
];
