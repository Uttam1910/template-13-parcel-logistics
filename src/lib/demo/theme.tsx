"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "parcel:theme";

/**
 * Runs before paint so the correct theme is applied on the very first frame.
 * Kept as a string literal because it is injected with `dangerouslySetInnerHTML`
 * in the root layout, ahead of hydration.
 */
export const themeScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="light"||s==="dark")?s:(m?"dark":"light");document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

/* ------------------------------------------------------------------ *
 * External theme store
 *
 * The theme lives in the DOM and in browser storage — both external systems —
 * so it is modelled as an external store and read with `useSyncExternalStore`.
 * That keeps the provider free of hydration effects and state cascades.
 * ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

let preferenceSnapshot: ThemePreference | null = null;
let resolvedSnapshot: ResolvedTheme | null = null;
let mediaQuery: MediaQueryList | null = null;

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? systemTheme() : preference;
}

function applyToDocument(theme: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Follow the operating system while the preference is "system".
  if (!mediaQuery) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (getPreferenceSnapshot() !== "system") return;
      resolvedSnapshot = systemTheme();
      applyToDocument(resolvedSnapshot);
      emit();
    });
  }

  return () => {
    listeners.delete(listener);
  };
}

function getPreferenceSnapshot(): ThemePreference {
  preferenceSnapshot ??= readPreference();
  return preferenceSnapshot;
}

function getResolvedSnapshot(): ResolvedTheme {
  resolvedSnapshot ??= resolve(getPreferenceSnapshot());
  return resolvedSnapshot;
}

const getServerPreference = (): ThemePreference => "system";
const getServerTheme = (): ResolvedTheme => "light";

function writePreference(next: ThemePreference) {
  preferenceSnapshot = next;
  resolvedSnapshot = resolve(next);
  applyToDocument(resolvedSnapshot);
  try {
    if (next === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this session.
  }
  emit();
}

type ThemeContextValue = {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(
    subscribe,
    getPreferenceSnapshot,
    getServerPreference,
  );
  const theme = useSyncExternalStore(subscribe, getResolvedSnapshot, getServerTheme);

  const setPreference = useCallback((next: ThemePreference) => {
    writePreference(next);
  }, []);

  const toggle = useCallback(() => {
    writePreference(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
