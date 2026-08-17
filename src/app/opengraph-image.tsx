import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The Open Graph card. Drawn with the same ink/amber language as the app, using
 * only system fonts and inline SVG so nothing is fetched at build time.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b1520",
        color: "#e8eef5",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      {/* Graticule */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(to right, #16232f 1px, transparent 1px), linear-gradient(to bottom, #16232f 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.4 L21.4 7 L12 11.6 L2.6 7 Z" fill="#f0a552" />
          <path d="M2.6 7 V17 L12 21.6 V11.6 Z" stroke="#e8eef5" strokeWidth="1.4" />
          <path d="M21.4 7 V17 L12 21.6 V11.6 Z" stroke="#e8eef5" strokeWidth="1.4" />
        </svg>
        <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
          {siteConfig.name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontSize: 17,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#f0a552",
          }}
        >
          Shipment tracking &amp; delivery operations
        </span>
        <span
          style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: -2.5,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Every shipment. One clear view.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid #22303d",
          paddingTop: 28,
        }}
      >
        <span style={{ fontSize: 24, color: "#9aabbb" }}>{siteConfig.tagline}</span>
        <span style={{ fontSize: 19, color: "#8598a9", letterSpacing: 2 }}>
          DEMO TEMPLATE — NO CARRIER CONNECTED
        </span>
      </div>
    </div>,
    size,
  );
}
