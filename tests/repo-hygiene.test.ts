import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(process.cwd());
const SRC = join(ROOT, "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(SRC).filter((file) =>
  [".ts", ".tsx", ".css", ".svg"].includes(extname(file)),
);

const readSource = (file: string) => ({
  path: relative(ROOT, file),
  content: readFileSync(file, "utf8"),
});

/**
 * Assembled at runtime so this file does not trip its own checks.
 */
const MARKERS = ["TO" + "DO", "FIX" + "ME", "XX" + "X:", "HA" + "CK:"];

describe("source hygiene", () => {
  it("contains no unfinished-work markers", () => {
    const pattern = new RegExp(`\\b(${MARKERS.join("|")})`, "i");
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) => pattern.test(content))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("contains no console.log calls", () => {
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) => /console\.log\s*\(/.test(content))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("contains no debugger statements", () => {
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) => /\bdebugger\b/.test(content))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("contains no placeholder or lorem content", () => {
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) =>
        /lorem ipsum|coming soon|placeholder\.com|via\.placeholder|dummy text/i.test(content),
      )
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("makes no external network requests for images, fonts or data", () => {
    const allowed =
      /https?:\/\/(localhost|www\.w3\.org|nextjs\.org|react\.dev|help\.github\.com|fonts\.googleapis\.com)/;
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ path }) => !path.endsWith("lib/metadata.ts")) // documents the localhost fallback
      .filter(({ content }) => {
        const urls = content.match(/https?:\/\/[a-z0-9.-]+/gi) ?? [];
        return urls.some((url) => !allowed.test(url));
      })
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("uses no <img> tags — every illustration is inline SVG", () => {
    const offenders = sourceFiles
      .filter((file) => extname(file) === ".tsx")
      .map(readSource)
      .filter(({ content }) => /<img[\s>]/.test(content))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  /** Copy props on shared components: `title="…"`, `body="…"`, `description="…"`. */
  const COPY_PROP = /^\s*(?:title|body|description|eyebrow|hint|summary)="([^"]+)"/gm;
  /** Prose sitting directly between JSX tags. */
  const JSX_TEXT = />\s*([A-Z][^<>{}]{60,})\s*</g;
  const wordCount = (text: string) => text.trim().split(/\s+/).length;

  const pageFiles = sourceFiles.filter((file) => /[/\\]app[/\\].*page\.tsx$/.test(file));

  it("keeps marketing prose out of page components", () => {
    // Content modules are the source of truth; pages compose them. A page may
    // still hold its own `metadata` description — that is page configuration,
    // not marketing copy, so `export const metadata` is excluded first.
    const offenders: string[] = [];

    for (const { path, content } of pageFiles.map(readSource)) {
      const body = content.replace(/export const metadata[\s\S]*?\n\}\);\n/, "");

      const found = [
        ...[...body.matchAll(COPY_PROP)].map((match) => match[1]),
        ...[...body.matchAll(JSX_TEXT)].map((match) => match[1]),
      ].filter((text) => wordCount(text) >= 15);

      if (found.length > 0) offenders.push(`${path}: ${found[0].slice(0, 60)}…`);
    }

    expect(offenders).toEqual([]);
  });

  it("composes public pages from the content layer", () => {
    const offenders = pageFiles
      .filter((file) => /\(marketing\)/.test(file))
      .map(readSource)
      .filter(({ content }) => !/from "@\/content\//.test(content))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("demo boundary", () => {
  it("never claims a real carrier, GPS or map provider is connected", () => {
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) =>
        /mapbox|google maps|leaflet|openstreetmap|dhl|fedex|ups\.com|usps/i.test(content),
      )
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("uses only .demo email addresses for contact details", () => {
    // Scoped to the data and content layers: that is where a real address would
    // realistically be pasted in. Validation hints elsewhere may show the
    // *shape* of an address (name@company.com) without it being a contact.
    const offenders = sourceFiles
      .filter((file) => /[/\\]src[/\\](data|content)[/\\]/.test(file))
      .map(readSource)
      .filter(({ content }) => {
        const emails = content.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) ?? [];
        return emails.some((email) => !/\.demo$/i.test(email));
      })
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("secrets", () => {
  it("contains no credential-shaped literals", () => {
    const patterns = [
      /\bsk-[A-Za-z0-9]{16,}/,
      /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /\bghp_[A-Za-z0-9]{20,}/,
      /\bBearer\s+[A-Za-z0-9._-]{24,}/,
      /(api[_-]?key|secret|token|passwd)\s*[:=]\s*["'][^"']{16,}["']/i,
    ];
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) => patterns.some((pattern) => pattern.test(content)))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("ships no committed environment file", () => {
    expect(existsSync(join(ROOT, ".env"))).toBe(false);
    expect(existsSync(join(ROOT, ".env.local"))).toBe(false);
    expect(existsSync(join(ROOT, ".env.example"))).toBe(true);
  });

  it("reads its base URL only from the documented environment variable", () => {
    const offenders = sourceFiles
      .map(readSource)
      .filter(({ content }) => {
        const uses = content.match(/process\.env\.[A-Z_]+/g) ?? [];
        return uses.some((use) => use !== "process.env.NEXT_PUBLIC_APP_URL");
      })
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("repository", () => {
  const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");

  it("ignores build output, dependencies and environment files", () => {
    for (const entry of ["/node_modules", "/.next/", ".env*", "*.tsbuildinfo", ".DS_Store"]) {
      expect(gitignore).toContain(entry);
    }
  });

  it("has no build artefacts or scratch files checked in", () => {
    const stray = readdirSync(ROOT).filter((entry) =>
      /^(scratch|tmp|temp|screenshots?|playwright-report|test-results)/i.test(entry),
    );
    expect(stray).toEqual([]);
  });

  it("documents the template in a README", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    for (const section of [
      "PKL-10482",
      "npm run verify",
      "npm run dev",
      "src/data",
      "Limitations",
    ]) {
      expect(readme).toContain(section);
    }
  });

  it("declares only the dependencies it uses", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    const declared = Object.keys(pkg.dependencies);
    const used = new Set<string>();

    for (const { content } of sourceFiles.map(readSource)) {
      for (const match of content.matchAll(/from "([^".][^"]*)"/g)) {
        const name = match[1];
        if (name.startsWith("@/") || name.startsWith(".")) continue;
        used.add(
          name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0],
        );
      }
    }

    for (const dependency of declared) {
      if (dependency === "react-dom") continue; // required by next, imported by the framework
      expect(used.has(dependency), `${dependency} is declared but never imported`).toBe(true);
    }
  });
});
