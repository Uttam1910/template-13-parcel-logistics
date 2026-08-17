# Parcel — Logistics, without the guesswork.

A premium shipment-tracking and delivery-operations template built with Next.js 16, React 19,
TypeScript and Tailwind CSS v4.

Parcel is a **complete, self-contained demo environment**. There is no database, no carrier API, no
tracking API, no map provider, no authentication service and no payment provider. Every shipment,
facility, customer and scan is deterministic typed data in `src/data`, and every control in the
interface actually does something.

---

## What this is

Most shipment tracking tells you a status but not a story. A parcel sits at "in transit" for three
days and nobody — not the recipient, not the account manager, not the depot — can say why.

Parcel is built the other way round:

- **Every scan carries a place, a facility and a sentence a person can read.**
- **Public tracking and the operations workspace read the same shipment record.** There is no second
  copy to drift out of date.
- **Exceptions are first-class.** Delays and failed attempts are states with their own treatment, not
  an error string.
- **The route is drawn honestly.** Facilities are named nodes; there is no pin on a map implying a
  precision no carrier actually has.

### The tracking concept

Each shipment moves through a fixed seven-stage lifecycle and can only ever move forwards:

```
created → picked_up → origin_facility → in_transit → destination_facility → out_for_delivery → delivered
```

Two further statuses — `delayed` and `exception` — are _overlays_. They are raised at whatever stage
the shipment has reached, without moving it backwards. This is why a delayed parcel can still show
you exactly where it is stuck.

A shipment's `status` and `currentLocation` are **derived from its last event, by construction**
(see `src/data/shipments.ts`). They cannot disagree with the timeline, and the verification suite
asserts it.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build
npm run start        # serve the production build
npm run verify       # format check → lint → typecheck → tests → build
```

Requires Node.js 20.9 or newer.

### Environment

No secrets are needed. One optional variable, used for canonical URLs, Open Graph metadata, the
sitemap and robots:

```bash
cp .env.example .env.local
# NEXT_PUBLIC_APP_URL=https://your-domain.example
```

It falls back to `http://localhost:3000`.

---

## Demo tracking numbers

Enter any of these at `/tracking` — each is a different point in the lifecycle:

| Tracking number | Status               | Route                             |
| --------------- | -------------------- | --------------------------------- |
| `PKL-10482`     | In transit           | Aldermere → Vantry → Kingsmere    |
| `PKL-20841`     | Out for delivery     | Norwick → Aldermere → Eastmoor    |
| `PKL-31765`     | Delivered (with POD) | Eastmoor → Linthorpe → Aldermere  |
| `PKL-44120`     | Delayed              | Port Kestrel → Vantry → Aldermere |
| `PKL-58291`     | Exception            | Vantry → Kingsmere                |
| `PKL-69314`     | Delivered (with POD) | Linthorpe → Aldermere → Norwick   |

All **18** shipments in the dataset are trackable. Numbers are forgiving: `pkl-10482`, `PKL10482`,
`PKL 10482` and bare `10482` all resolve. Anything unknown gets a proper not-found state — the demo
never fabricates a result.

### Demo sign-in

`/login` accepts the fictional credentials `ops@parcel.demo` / `parcel-demo`, or you can press
**Enter demo**. Nothing leaves the browser and no account is created. The workspace is also reachable
without signing in.

---

## Routes

**Public**

| Route                        | What it is                                        |
| ---------------------------- | ------------------------------------------------- |
| `/`                          | Marketing home with a live shipment card          |
| `/tracking`                  | Tracking lookup, worked examples, not-found state |
| `/tracking/[trackingNumber]` | Status, route, scan history, proof of delivery    |
| `/services`                  | Five service levels                               |
| `/solutions`                 | Five operating contexts                           |
| `/coverage`                  | Region diagram, transit ranges, facility table    |
| `/about`                     | Company story, principles, demo statistics        |
| `/contact`                   | Validated demo contact form                       |

**Operations workspace** (`noindex`, excluded from the sitemap)

| Route             | What it is                                         |
| ----------------- | -------------------------------------------------- |
| `/login`          | Demo sign-in                                       |
| `/dashboard`      | Six live metrics, three charts, recent shipments   |
| `/shipments`      | Filterable board with URL state                    |
| `/shipments/[id]` | Internal shipment view with working status actions |
| `/customers`      | Accounts with a detail drawer                      |
| `/analytics`      | 7D / 30D / 90D / YTD, all live                     |
| `/settings`       | Profile, notifications, appearance, preferences    |

**Generated:** `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`, `/icon.svg`,
plus a 404 page.

---

## What actually works

Nothing in this template is a dead control.

- **Tracking lookup** resolves on the server — a hit redirects, a miss renders the not-found state.
  This works with JavaScript disabled.
- **Shipment actions** (advance stage, flag delay, mark exception, mark delivered) write real events.
  Mark a shipment delivered and its timeline grows, proof of delivery appears, the customer's
  delivered count moves and the dashboard metrics change.
- **Filters** on `/shipments` live in the URL — shareable, back-button friendly, and functional
  without JavaScript because every control is a link or a GET form.
- **Analytics ranges** genuinely re-bucket and regenerate every series (7 daily columns for 7D, one
  per month for YTD) and each KPI is computed from the series being drawn.
- **Settings** change the workspace: table density affects rows, the default range is what
  `/analytics` opens on, and the appearance control drives the real theme system.
- **Reset demo data** clears every local change, behind a confirmation dialog.

Local changes are stored in `localStorage` under `parcel:demo:v1`. The authored dataset in `src/data`
is never modified.

---

## Architecture

```
src/
  app/              Routes. Server Components by default.
    (marketing)/    Public site — header/footer shell
    (app)/          Operations workspace — sidebar shell
    login/
  content/          All marketing copy, as typed modules
    site.ts navigation.ts home.ts pages.ts
    services.ts solutions.ts coverage.ts about.ts
  data/             The demo dataset
    types.ts shipments.ts facilities.ts customers.ts analytics.ts users.ts
  lib/
    shipments.ts    ← every read of the shipment dataset goes through here
    status.ts       ← every status label, tone, icon and transition
    metrics.ts filters.ts format.ts geo.ts metadata.ts routes.ts
    demo/store.tsx  Local state (session, edits, preferences)
    demo/theme.tsx  Theme, with pre-paint initialisation
  components/
    layout/ ui/ art/ tracking/ shipments/ dashboard/ customers/ analytics/ settings/ forms/ charts/
```

### Key decisions

**One source of truth.** `src/data/shipments.ts` builds each record from a small spec, so `status`
and `currentLocation` are _derived_ from the event history rather than authored alongside it.
`resolveShipment()` in the demo store applies local edits the same way, so a locally-modified
shipment stays internally consistent too.

**Status lives in one place.** `src/lib/status.ts` owns every label, description, tone, icon,
filter grouping and allowed transition. No component writes a status string of its own.

**Colour is never the only signal.** Every badge renders a marker _and_ its label; delta arrows
carry direction plus screen-reader text.

**No images.** Every illustration — route diagrams, coverage map, package marks, signature marks,
charts, logo, favicon, OG card — is deterministic inline SVG or CSS. There are zero external
requests at runtime.

**Two authored themes.** Dark is not an inversion of light; both palettes are written independently
in `src/app/globals.css`. Theme is applied before first paint, so there is no flash.

---

## Customising

| To change…           | Edit…                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Colours, type, radii | `src/app/globals.css` (tokens at the top)                         |
| Company name, copy   | `src/content/site.ts` and the rest of `src/content/`              |
| Navigation           | `src/content/navigation.ts`                                       |
| Shipments and scans  | `src/data/shipments.ts`                                           |
| Network facilities   | `src/data/facilities.ts` (+ `point` coordinates for the diagrams) |
| Statuses             | `src/lib/status.ts`                                               |
| Regions on the map   | `src/lib/geo.ts` and `src/content/coverage.ts`                    |

Typed routes are enabled, so a broken internal link fails the build rather than shipping.

### Connecting a real system

The integration boundary is deliberately narrow:

1. **`src/lib/shipments.ts`** is the only module that reads the dataset. Reimplement
   `getShipmentByTracking`, `getShipmentById`, `getAllShipments` and `getShipmentsForCustomer` as
   async calls to your carrier or WMS and keep the return shapes from `src/data/types.ts`.
2. Make the pages that call them `async` (they already are on the dynamic routes).
3. **`advanceStage` / `markDelivered` / `markException` / `markDelayed`** are pure functions that
   return the event to append. Point them at your write API.
4. `src/data/analytics.ts` generates illustrative figures — replace `getAnalytics(range)` with a
   query.

Deliberately **not** implemented: any carrier SDK, map provider, auth provider, email/SMS transport
or payment integration.

---

## Verification

```bash
npm run verify
```

Runs Prettier's check, ESLint, `tsc --noEmit`, the Vitest suite and a production build.

The suite (`tests/`) covers:

- **`data-integrity`** — unique tracking numbers and ids; every customer/facility reference resolves;
  routes start at the origin and end at the destination; status matches the last event; current
  location matches the last event; events are chronological and never move backwards; proof of
  delivery exists if and only if the shipment is delivered; every displayable status appears in the
  dataset.
- **`tracking`** — lookup and normalisation; invalid tracking behaviour; status transitions and their
  guards; route progress; filtering, searching and sorting.
- **`analytics`** — each range produces different, deterministic, bounded series; KPIs match the
  charted data; network metrics stay consistent.
- **`demo-state`** — reducer behaviour; merging local edits without mutating the authored record;
  metrics moving after a local mutation; reset.
- **`routes`** — the exact route set; no dead internal links; every route is reachable from
  navigation; sitemap includes public routes and excludes private ones; robots disallows the
  workspace; every page declares metadata; one `<h1>` per page.
- **`repo-hygiene`** — no unfinished-work markers, `console.log`, `debugger` or placeholder copy; no
  external network requests; no `<img>` tags; no credential-shaped literals; no committed `.env`;
  no undeclared or unused dependencies.

### Browser QA

The template was audited with Chromium at 390, 768, 1024 and 1440 px in both themes across all
routes: zero console errors, zero failed requests, no horizontal overflow, one `<h1>` per page, and
keyboard-operable dialogs, menus and forms.

---

## Accessibility

Skip link, landmark regions, one `<h1>` per page and an ordered heading hierarchy. Labelled controls
with `aria-invalid` and `aria-describedby` on errors, and focus moved to the first invalid field on
submit. `aria-current` on active navigation, `aria-expanded` on disclosures. Dialogs trap focus,
close on Escape and return focus to their trigger. Charts expose their values to screen readers.
Status is never communicated by colour alone. `prefers-reduced-motion` disables the route dash and
marker pulse.

---

## Limitations

These are genuine, and deliberate:

- **No backend.** All state is local; it does not sync between browsers or devices.
- **No real logistics.** Carriers, facilities, regions, customers, people and figures are invented.
  Nothing is ever shipped, scanned, delivered or messaged.
- **The route view is a diagram, not a map.** Facility coordinates are abstract points in a 0–100
  space; there is no geographic data and no GPS.
- **Analytics are generated.** Deterministic and internally consistent, but illustrative of a network
  far larger than the 18 demo shipments. Dashboard metrics, by contrast, are computed from the real
  records.
- **Authentication is cosmetic.** Credentials are compared in the browser. The workspace is not
  protected and must not be treated as if it were.
- **"Delivered today"** is measured against the dataset's anchor date (`DEMO_TODAY`, 2026-08-17), so
  the demo reads the same on every machine.
- **Public tracking pages are in the sitemap** because they are this template's shareable artefact.
  Behind a real carrier you would almost certainly remove them — a tracking URL identifies a
  delivery address.

---

## Licence

Provided as a commercial template. All content — company, people, addresses, shipments and figures —
is fictional.
