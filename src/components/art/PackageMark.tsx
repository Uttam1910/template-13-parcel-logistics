import type { PackageKind } from "@/data/types";

/**
 * The package illustration system.
 *
 * One deterministic SVG per package kind, drawn from the kraft/tape tones in
 * the token set so it themes with the rest of the interface. No image requests.
 */
export function PackageMark({
  kind,
  className = "",
}: {
  kind: PackageKind;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`${kind.replace(/_/g, " ")} illustration`}
    >
      {kind === "envelope" ? (
        <g>
          <rect
            x={6}
            y={13}
            width={36}
            height={22}
            fill="var(--art-kraft)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
          />
          <path
            d="M6 13 L24 27 L42 13"
            fill="none"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
          />
          <path d="M6 35 L19 24 M42 35 L29 24" stroke="var(--art-kraft-2)" strokeWidth={1} />
        </g>
      ) : null}

      {kind === "parcel" || kind === "box" ? (
        <g>
          <path
            d="M24 6 L42 14 L24 22 L6 14 Z"
            fill="var(--art-kraft)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d="M6 14 L6 34 L24 42 L24 22 Z"
            fill="var(--art-kraft-2)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d="M42 14 L42 34 L24 42 L24 22 Z"
            fill="var(--art-kraft)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path d="M24 22 L24 42" stroke="var(--art-tape)" strokeWidth={3} />
          <path d="M15 10 L33 18" stroke="var(--art-tape)" strokeWidth={3} />
          {kind === "box" ? (
            <rect
              x={28}
              y={26}
              width={9}
              height={6}
              fill="var(--parcel-surface)"
              stroke="var(--art-kraft-2)"
              strokeWidth={1}
            />
          ) : null}
        </g>
      ) : null}

      {kind === "pallet" ? (
        <g>
          <rect
            x={9}
            y={12}
            width={30}
            height={18}
            fill="var(--art-kraft)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
          />
          <path d="M9 21 L39 21 M24 12 L24 30" stroke="var(--art-kraft-2)" strokeWidth={1} />
          <rect
            x={5}
            y={32}
            width={38}
            height={4}
            fill="var(--art-edge)"
            stroke="var(--art-node)"
            strokeWidth={1}
          />
          <rect x={8} y={36} width={5} height={5} fill="var(--art-node)" />
          <rect x={21.5} y={36} width={5} height={5} fill="var(--art-node)" />
          <rect x={35} y={36} width={5} height={5} fill="var(--art-node)" />
        </g>
      ) : null}

      {kind === "crate" ? (
        <g>
          <rect
            x={7}
            y={11}
            width={34}
            height={26}
            fill="var(--art-kraft)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1.5}
          />
          <path d="M7 11 L41 37 M41 11 L7 37" stroke="var(--art-kraft-2)" strokeWidth={1.5} />
          <rect
            x={7}
            y={11}
            width={34}
            height={5}
            fill="var(--art-kraft-2)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1}
          />
          <rect
            x={7}
            y={32}
            width={34}
            height={5}
            fill="var(--art-kraft-2)"
            stroke="var(--art-kraft-2)"
            strokeWidth={1}
          />
        </g>
      ) : null}
    </svg>
  );
}

/**
 * The signature-style mark shown on proof of delivery. Deterministic: the
 * stroke is derived from the initials, so the same delivery always draws the
 * same mark, and it is explicitly a demo artefact rather than a real signature.
 */
export function SignatureMark({
  initials,
  className = "",
}: {
  initials: string;
  className?: string;
}) {
  const seed = initials
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const lift = 8 + (seed % 7);
  const dip = 26 + (seed % 5);
  const tail = 62 + (seed % 18);

  return (
    <svg
      viewBox="0 0 100 34"
      className={className}
      role="img"
      aria-label={`Demo signature mark for ${initials}`}
    >
      <path
        d={`M6 ${dip} C 14 ${lift}, 22 ${dip + 4}, 30 ${dip - 2} S 44 ${lift + 2}, 52 ${dip} S ${tail} ${lift + 6}, 94 ${dip - 6}`}
        fill="none"
        stroke="var(--parcel-ink-muted)"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d={`M30 ${dip + 6} L 74 ${dip + 6}`}
        stroke="var(--parcel-line-strong)"
        strokeWidth={0.8}
        strokeDasharray="2 2"
      />
    </svg>
  );
}
