"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  MessageSquarePlus,
  PackageCheck,
  Trash2,
} from "lucide-react";
import { requireCustomer } from "@/data/customers";
import type { Shipment } from "@/data/types";
import { demoAccount } from "@/data/users";
import { demoNotices } from "@/content/site";
import { useShipment } from "@/lib/demo/store";
import { formatDateTime } from "@/lib/format";
import { trackingHref } from "@/lib/routes";
import { advanceStage, markDelayed, markDelivered, markException } from "@/lib/shipments";
import { availableActions, stageLabels, statusMeta } from "@/lib/status";
import { RouteMap } from "@/components/art/RouteMap";
import { EventTimeline } from "@/components/tracking/EventTimeline";
import { ProofOfDeliveryPanel } from "@/components/tracking/ProofOfDeliveryPanel";
import { ShipmentFacts } from "@/components/tracking/ShipmentFacts";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Dialog } from "@/components/ui/Dialog";
import { Panel, PanelHeader } from "@/components/ui/display";
import { StatusBadge, StatusHeadline } from "@/components/ui/StatusBadge";
import { Field, Textarea, describedBy } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";

/**
 * The internal operations view of a shipment.
 *
 * Same record as the public tracking page, plus the things a customer should
 * not see: internal notes and the actions that change status. Every action
 * writes a real event, so the timeline, proof of delivery, dashboard counts and
 * shipment board all move together.
 */
export function ShipmentWorkspace({ shipment: base }: { shipment: Shipment }) {
  const { shipment, apply, addNote, deleteNote } = useShipment(base);
  const { notify } = useToast();
  const customer = requireCustomer(shipment.customerId);
  const actions = availableActions(shipment);

  const [flagOpen, setFlagOpen] = useState<"exception" | "delayed" | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>(undefined);
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | undefined>(undefined);

  const closeFlag = () => {
    setFlagOpen(null);
    setReason("");
    setReasonError(undefined);
  };

  const submitFlag = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 8) {
      setReasonError("Give a reason of at least 8 characters — it appears on the timeline.");
      return;
    }
    const mutation =
      flagOpen === "exception"
        ? markException(shipment, trimmed)
        : markDelayed(shipment, trimmed);
    apply(mutation);
    notify(
      flagOpen === "exception"
        ? "Exception raised. The timeline and dashboard counts have been updated."
        : "Delay flagged. The timeline and dashboard counts have been updated.",
    );
    closeFlag();
  };

  const submitNote = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = noteBody.trim();
    if (trimmed.length < 3) {
      setNoteError("Write a note of at least 3 characters.");
      return;
    }
    addNote(trimmed, demoAccount.user.name);
    setNoteBody("");
    setNoteError(undefined);
    notify("Internal note added.", "info");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="parcel-numeral text-xl font-semibold tracking-tight sm:text-2xl">
                {shipment.trackingNumber}
              </h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="mt-2 text-[0.875rem] text-ink-muted">
              {customer.name} · {shipment.recipient.name}
              {shipment.recipient.company ? `, ${shipment.recipient.company}` : ""}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-faint">
              Currently at{" "}
              <span className="font-medium text-ink-muted">{shipment.currentLocation}</span> ·
              stage{" "}
              {stageLabels[shipment.events[shipment.events.length - 1].stage].toLowerCase()}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <Link
              href={trackingHref(shipment.trackingNumber)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <ExternalLink aria-hidden="true" className="size-3.5" />
              View public tracking page
            </Link>
            <p className="parcel-numeral text-[0.6875rem] text-ink-faint">
              ETA {formatDateTime(shipment.eta)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {actions.advance ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                apply(advanceStage(shipment));
                notify(`Advanced to “${stageLabels[actions.advance!].toLowerCase()}”.`);
              }}
            >
              <ArrowRight aria-hidden="true" className="size-3.5" />
              Advance to {stageLabels[actions.advance].toLowerCase()}
            </Button>
          ) : null}

          {actions.canDeliver ? (
            <Button
              size="sm"
              onClick={() => {
                apply(markDelivered(shipment));
                notify("Marked as delivered. Proof of delivery is now available.");
              }}
            >
              <PackageCheck aria-hidden="true" className="size-3.5" />
              Mark delivered
            </Button>
          ) : null}

          {actions.canFlagDelay ? (
            <Button variant="secondary" size="sm" onClick={() => setFlagOpen("delayed")}>
              <Clock aria-hidden="true" className="size-3.5" />
              Flag delay
            </Button>
          ) : null}

          {actions.canFlagException ? (
            <Button variant="danger" size="sm" onClick={() => setFlagOpen("exception")}>
              <AlertTriangle aria-hidden="true" className="size-3.5" />
              Mark exception
            </Button>
          ) : null}

          {!actions.canDeliver ? (
            <p className="flex items-center text-[0.75rem] text-ink-faint">
              This shipment is delivered — its record is complete.
            </p>
          ) : null}
        </div>

        <DemoNotice className="mt-3">{demoNotices.workspace}</DemoNotice>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel>
            <PanelHeader title="Status" />
            <div className="p-4 sm:p-5">
              <StatusHeadline status={shipment.status} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Shipment details" />
            <ShipmentFacts shipment={shipment} />
          </Panel>

          <Panel>
            <PanelHeader
              title="Route"
              description="Origin to destination through the network"
            />
            <div className="p-4 sm:p-5">
              <RouteMap shipment={shipment} />
            </div>
          </Panel>

          <ProofOfDeliveryPanel shipment={shipment} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel>
            <PanelHeader
              title="Tracking history"
              description={`${shipment.events.length} scans recorded`}
            />
            <div className="p-4 sm:p-5">
              <EventTimeline shipment={shipment} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Internal notes" description="Not shown on the public page" />
            <div className="p-4 sm:p-5">
              <form onSubmit={submitNote} className="flex flex-col gap-3">
                <Field
                  id="shipment-note"
                  label="Add a note"
                  error={noteError}
                  required
                  hint="Operational context for whoever picks this shipment up next."
                >
                  <Textarea
                    id="shipment-note"
                    value={noteBody}
                    onChange={(event) => {
                      setNoteBody(event.target.value);
                      if (noteError) setNoteError(undefined);
                    }}
                    aria-invalid={noteError ? true : undefined}
                    aria-describedby={describedBy(
                      "shipment-note",
                      "Operational context for whoever picks this shipment up next.",
                      noteError,
                    )}
                    placeholder="Customer called about the delivery window…"
                    className="min-h-20"
                  />
                </Field>
                <div>
                  <Button type="submit" size="sm" variant="secondary">
                    <MessageSquarePlus aria-hidden="true" className="size-3.5" />
                    Add note
                  </Button>
                </div>
              </form>

              {shipment.notes.length === 0 ? (
                <p className="mt-5 border-t border-line pt-4 text-[0.8125rem] text-ink-faint">
                  No internal notes on this shipment yet.
                </p>
              ) : (
                <ul className="mt-5 flex flex-col border-t border-line">
                  {shipment.notes.map((note) => {
                    const local = note.id.includes("-note-local-");
                    return (
                      <li key={note.id} className="border-b border-line py-3 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[0.8125rem] leading-relaxed text-ink">
                              {note.body}
                            </p>
                            <p className="parcel-numeral mt-1.5 text-[0.6875rem] text-ink-faint">
                              {note.author} · {formatDateTime(note.at)}
                            </p>
                          </div>
                          {local ? (
                            <button
                              type="button"
                              onClick={() => deleteNote(note.id)}
                              className="shrink-0 rounded-sm p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                            >
                              <Trash2 aria-hidden="true" className="size-3.5" />
                              <span className="sr-only">Delete note</span>
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Flag dialog */}
      <Dialog
        open={flagOpen !== null}
        onClose={closeFlag}
        title={flagOpen === "exception" ? "Raise an exception" : "Flag a delay"}
        description={
          flagOpen === "exception"
            ? statusMeta.exception.description
            : statusMeta.delayed.description
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeFlag}>
              Cancel
            </Button>
            <Button
              variant={flagOpen === "exception" ? "danger" : "primary"}
              onClick={submitFlag}
            >
              {flagOpen === "exception" ? "Raise exception" : "Flag delay"}
            </Button>
          </>
        }
      >
        <Field
          id="flag-reason"
          label="Reason"
          required
          error={reasonError}
          hint="This appears on the public tracking timeline, so write it for the recipient."
        >
          <Textarea
            id="flag-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (reasonError) setReasonError(undefined);
            }}
            aria-invalid={reasonError ? true : undefined}
            aria-describedby={describedBy(
              "flag-reason",
              "This appears on the public tracking timeline, so write it for the recipient.",
              reasonError,
            )}
            placeholder={
              flagOpen === "exception"
                ? "Delivery attempted — no answer and no safe place available."
                : "Held at the sort center: trunk departure delayed by weather."
            }
          />
        </Field>
      </Dialog>
    </div>
  );
}
