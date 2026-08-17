import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Form primitives.
 *
 * Every control is labelled, every error is announced through
 * `aria-describedby`, and invalid controls carry `aria-invalid` — which is also
 * what drives the error styling, so the two can never disagree.
 */

const control =
  "w-full rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink " +
  "placeholder:text-ink-faint transition-colors " +
  "hover:border-ink-faint focus:border-accent " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-soft/40";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label htmlFor={id} className="text-[0.8125rem] font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-[0.75rem] font-normal text-ink-faint">(optional)</span>
        )}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-[0.75rem] text-ink-faint">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.75rem] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Builds the `aria-describedby` value from whichever helpers exist. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const parts = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} h-10 ${className}`.trim()} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${control} min-h-28 py-2.5 ${className}`.trim()} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${control} h-10 cursor-pointer pr-8 ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

/**
 * A switch. Uses a real `<button role="switch">` so it is keyboard operable and
 * announces its state, with the label wired through `aria-labelledby`.
 */
export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[0.8125rem] font-medium text-ink">
          {label}
        </p>
        {description ? (
          <p id={`${id}-description`} className="mt-0.5 text-[0.75rem] text-ink-faint">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          checked ? "border-accent bg-accent" : "border-line-strong bg-surface-3"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-3.5 rounded-full transition-transform ${
            checked ? "translate-x-4 bg-accent-fg" : "translate-x-0.5 bg-line-strong"
          }`}
        />
      </button>
    </div>
  );
}
