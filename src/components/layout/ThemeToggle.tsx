"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/demo/theme";

/**
 * Theme toggle. Renders the icon for the theme it will switch *to*, and always
 * carries a label so it is operable without seeing the icon.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${next} theme`}
      className={`inline-flex size-9 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink ${className}`.trim()}
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
      <span className="sr-only">Switch to {next} theme</span>
    </button>
  );
}
