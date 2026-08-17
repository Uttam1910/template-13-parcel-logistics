"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { demoNotices } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";

type Fields = { name: string; email: string; company: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", email: "", company: "", message: "" };

const hints: Record<keyof Fields, string | undefined> = {
  name: undefined,
  email: "We reply to this address in a connected system.",
  company: undefined,
  message: "Tell us about the volume, lanes and services you need.",
};

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address, for example name@company.com.";
  }
  if (!values.message.trim()) {
    errors.message = "Enter a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Tell us a little more — at least 10 characters.";
  }
  return errors;
}

/**
 * The contact form.
 *
 * Validates on submit, moves focus to the first invalid control, announces the
 * outcome through a live region, and is explicit that nothing is sent.
 */
export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (key: keyof Fields, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const firstInvalid = (["name", "email", "company", "message"] as const).find(
      (key) => found[key],
    );
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#contact-${firstInvalid}`)?.focus();
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 border border-success/30 bg-success-soft p-6"
      >
        <span className="inline-flex size-10 items-center justify-center rounded-sm border border-success/30 bg-surface text-success">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-[0.9375rem] font-semibold text-ink">Message received</p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">
            Thanks {values.name.trim().split(/\s+/)[0]} — in a connected system this would reach
            the sales desk. {demoNotices.form}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setValues(empty);
            setErrors({});
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" label="Name" required error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("contact-name", hints.name, errors.name)}
          />
        </Field>

        <Field
          id="contact-email"
          label="Email"
          required
          error={errors.email}
          hint={hints.email}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("contact-email", hints.email, errors.email)}
          />
        </Field>
      </div>

      <Field id="contact-company" label="Company" error={errors.company}>
        <Input
          id="contact-company"
          name="company"
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
          autoComplete="organization"
          aria-invalid={errors.company ? true : undefined}
          aria-describedby={describedBy("contact-company", hints.company, errors.company)}
        />
      </Field>

      <Field
        id="contact-message"
        label="Message"
        required
        error={errors.message}
        hint={hints.message}
      >
        <Textarea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("contact-message", hints.message, errors.message)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">
          <Send aria-hidden="true" className="size-4" />
          Send message
        </Button>
        <p className="text-[0.75rem] text-ink-faint">{demoNotices.form}</p>
      </div>
    </form>
  );
}
