"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Mail, Phone, Search } from "lucide-react";
import { customerStatusLabels, customers as allCustomers, tierLabels } from "@/data/customers";
import { regionLabels } from "@/data/facilities";
import type { Customer, Shipment } from "@/data/types";
import { useShipments } from "@/lib/demo/store";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { customerStats, type CustomerStats } from "@/lib/metrics";
import { shipmentHref } from "@/lib/routes";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { InfoGrid, Panel, PanelHeader } from "@/components/ui/display";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * Customer accounts.
 *
 * Performance figures are derived from the same shipment records the rest of
 * the workspace uses, so a status change on a shipment moves its customer's
 * delivered and exception counts too.
 */
export function CustomersView({ shipments: base }: { shipments: Shipment[] }) {
  const { shipments } = useShipments(base);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return allCustomers
      .map((customer) => ({
        customer,
        shipments: shipments.filter((shipment) => shipment.customerId === customer.id),
      }))
      .map((row) => ({ ...row, stats: customerStats(row.shipments) }))
      .filter(
        ({ customer }) =>
          !needle ||
          `${customer.name} ${customer.industry} ${customer.contact.name} ${customer.address.city}`
            .toLowerCase()
            .includes(needle),
      );
  }, [shipments, search]);

  const selectedRow = selected
    ? (rows.find((row) => row.customer.id === selected.id) ?? null)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-4">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor="customer-search" className="sr-only">
            Search customers
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="customer-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, industry, contact or city"
            className="h-10 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-ink-faint focus:border-accent"
          />
        </div>
        <p className="mt-3 text-[0.8125rem] text-ink-muted" role="status">
          <span className="parcel-numeral font-semibold text-ink">{rows.length}</span>{" "}
          {rows.length === 1 ? "customer" : "customers"}
        </p>
      </Panel>

      <Panel>
        {rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No customers match"
            body="No account in the demo dataset matches that search."
            action={
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex h-9 items-center rounded-sm border border-line-strong px-4 text-[0.8125rem] font-medium text-ink hover:bg-surface-2"
              >
                Clear search
              </button>
            }
          />
        ) : (
          <div className="parcel-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Customer accounts with shipment and delivery performance
              </caption>
              <thead>
                <tr className="border-b border-line">
                  {[
                    "Customer",
                    "Shipments",
                    "Delivered",
                    "Exceptions",
                    "Last shipment",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className={`parcel-eyebrow px-3 py-2.5 font-medium whitespace-nowrap ${
                        heading === "Exceptions" || heading === "Last shipment"
                          ? "hidden md:table-cell"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ customer, stats }) => (
                  <tr
                    key={customer.id}
                    className="border-b border-line last:border-b-0 hover:bg-surface-2"
                  >
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => setSelected(customer)}
                        className="text-left text-[0.8125rem] font-semibold text-ink hover:text-accent"
                      >
                        {customer.name}
                      </button>
                      <span className="mt-0.5 block text-[0.6875rem] text-ink-faint">
                        {tierLabels[customer.tier]} · {customer.industry}
                      </span>
                    </td>
                    <td className="parcel-numeral px-3 py-3 align-top text-[0.8125rem] text-ink-muted">
                      {stats.total}
                    </td>
                    <td className="parcel-numeral px-3 py-3 align-top text-[0.8125rem] text-ink-muted">
                      {stats.delivered}
                    </td>
                    <td className="parcel-numeral hidden px-3 py-3 align-top text-[0.8125rem] md:table-cell">
                      <span className={stats.exceptions > 0 ? "text-danger" : "text-ink-muted"}>
                        {stats.exceptions}
                      </span>
                    </td>
                    <td className="parcel-numeral hidden px-3 py-3 align-top text-[0.8125rem] text-ink-muted md:table-cell">
                      {stats.lastShipmentAt ? formatDate(stats.lastShipmentAt) : "—"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[0.6875rem] font-medium ${
                          customer.status === "active"
                            ? "border-success/30 bg-success-soft text-success"
                            : customer.status === "onboarding"
                              ? "border-info/30 bg-info-soft text-info"
                              : "border-line bg-surface-3 text-ink-muted"
                        }`}
                      >
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                        {customerStatusLabels[customer.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <CustomerDrawer
        row={selectedRow}
        onClose={() => setSelected(null)}
        shipments={
          selectedRow
            ? shipments.filter((shipment) => shipment.customerId === selectedRow.customer.id)
            : []
        }
      />
    </div>
  );
}

function CustomerDrawer({
  row,
  shipments,
  onClose,
}: {
  row: { customer: Customer; stats: CustomerStats } | null;
  shipments: Shipment[];
  onClose: () => void;
}) {
  return (
    <Dialog
      open={row !== null}
      onClose={onClose}
      variant="drawer"
      title={row?.customer.name ?? "Customer"}
      description={
        row ? `${tierLabels[row.customer.tier]} account · ${row.customer.industry}` : undefined
      }
    >
      {row ? (
        <div className="flex flex-col gap-5">
          <section aria-labelledby="customer-performance">
            <h3 id="customer-performance" className="parcel-eyebrow mb-2">
              Delivery performance
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Shipments", value: String(row.stats.total) },
                { label: "Delivered", value: String(row.stats.delivered) },
                { label: "Active", value: String(row.stats.active) },
                {
                  label: "On-time",
                  value:
                    row.stats.onTimeRate === null
                      ? "—"
                      : formatPercent(row.stats.onTimeRate, 0),
                },
              ].map((item) => (
                <div key={item.label} className="border border-line bg-surface-2 p-3">
                  <p className="parcel-eyebrow text-[0.5625rem]">{item.label}</p>
                  <p className="parcel-numeral mt-1 text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="customer-details">
            <h3 id="customer-details" className="sr-only">
              Account details
            </h3>
            <Panel>
              <PanelHeader title="Account" as="h4" />
              <InfoGrid
                columns={2}
                items={[
                  { label: "Status", value: customerStatusLabels[row.customer.status] },
                  { label: "Customer since", value: formatDate(row.customer.since) },
                  {
                    label: "Monthly volume",
                    value: `${formatNumber(row.customer.monthlyVolume)} parcels`,
                  },
                  { label: "Account manager", value: row.customer.accountManager },
                  {
                    label: "Address",
                    value: `${row.customer.address.line}, ${row.customer.address.city} (${regionLabels[row.customer.address.region]})`,
                    wide: true,
                  },
                ]}
              />
              <div className="flex flex-col gap-2 border-t border-line px-4 py-3">
                <p className="text-[0.8125rem] font-medium text-ink">
                  {row.customer.contact.name}
                </p>
                <a
                  href={`mailto:${row.customer.contact.email}`}
                  className="inline-flex items-center gap-2 text-[0.8125rem] text-ink-muted hover:text-accent"
                >
                  <Mail aria-hidden="true" className="size-3.5" />
                  {row.customer.contact.email}
                </a>
                <a
                  href={`tel:${row.customer.contact.phone.replace(/[^+\d]/g, "")}`}
                  className="parcel-numeral inline-flex items-center gap-2 text-[0.8125rem] text-ink-muted hover:text-accent"
                >
                  <Phone aria-hidden="true" className="size-3.5" />
                  {row.customer.contact.phone}
                </a>
              </div>
            </Panel>
          </section>

          <section aria-labelledby="customer-shipments">
            <h3 id="customer-shipments" className="parcel-eyebrow mb-2">
              Shipment history
            </h3>
            {shipments.length === 0 ? (
              <p className="border border-line bg-surface-2 px-3 py-4 text-[0.8125rem] text-ink-faint">
                No shipments recorded for this account yet.
              </p>
            ) : (
              <ul className="flex flex-col border border-line bg-surface">
                {shipments.map((shipment) => (
                  <li
                    key={shipment.id}
                    className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                  >
                    <Link
                      href={shipmentHref(shipment.id)}
                      onClick={onClose}
                      className="parcel-numeral min-w-0 truncate text-[0.8125rem] font-semibold text-ink hover:text-accent"
                    >
                      {shipment.trackingNumber}
                    </Link>
                    <StatusBadge status={shipment.status} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Dialog>
  );
}
