import type { ElementType, ReactNode } from "react";

/**
 * Layout and typographic primitives shared by the public site and the
 * workspace. Keeping them here is what stops twenty pages from each inventing
 * their own section spacing.
 */

export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  } as const;
  return (
    <div className={`mx-auto w-full ${widths[size]} px-5 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`parcel-eyebrow ${className}`.trim()}>{children}</p>;
}

/**
 * A section header with the hairline + eyebrow treatment used throughout the
 * marketing site. `as` keeps the heading hierarchy correct per page.
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  as: Tag = "h2",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  as?: ElementType;
  align?: "left" | "center";
  className?: string;
}) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "";
  return (
    <div className={`flex flex-col gap-3 ${alignment} ${className}`.trim()}>
      {eyebrow ? (
        <div
          className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
        >
          <span aria-hidden="true" className="h-px w-6 bg-accent" />
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <Tag className="text-2xl leading-tight text-balance sm:text-3xl">{title}</Tag>
      {body ? (
        <p
          className={`max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

/** A bordered surface. The workhorse container of the whole template. */
export function Panel({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={`border border-line bg-surface ${className}`.trim()}>{children}</Tag>;
}

export function PanelHeader({
  title,
  action,
  description,
  as: Tag = "h2",
  className = "",
}: {
  title: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 ${className}`.trim()}
    >
      <div className="min-w-0">
        <Tag className="text-[0.9375rem] font-semibold">{title}</Tag>
        {description ? (
          <p className="mt-0.5 text-[0.8125rem] text-ink-faint">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * The compact label/value grid used for shipment details, package information
 * and customer records.
 */
export function InfoGrid({
  items,
  columns = 3,
  className = "",
}: {
  items: { label: string; value: ReactNode; wide?: boolean }[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <dl className={`grid grid-cols-1 ${columnClass} ${className}`.trim()}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`border-b border-line px-4 py-3 last:border-b-0 sm:border-r sm:px-5 ${
            item.wide ? "sm:col-span-2" : ""
          }`}
        >
          <dt className="parcel-eyebrow">{item.label}</dt>
          <dd className="mt-1.5 text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A hairline separator with the technical hatch treatment. */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`h-px border-0 bg-line ${className}`.trim()} />;
}

/** Consistent vertical rhythm for marketing sections. */
export function Section({
  children,
  className = "",
  id,
  as: Tag = "section",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
  labelledBy?: string;
}) {
  return (
    <Tag id={id} aria-labelledby={labelledBy} className={`py-14 sm:py-20 ${className}`.trim()}>
      {children}
    </Tag>
  );
}
