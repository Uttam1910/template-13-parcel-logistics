/** Keyboard users land here first; visible only when focused. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-sm border border-accent bg-accent px-4 py-2 text-sm font-medium text-accent-fg focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
    >
      Skip to content
    </a>
  );
}
