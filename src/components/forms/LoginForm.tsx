"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn } from "lucide-react";
import { demoAccount } from "@/data/users";
import { demoNotices } from "@/content/site";
import { useSession } from "@/lib/demo/store";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Field, Input, describedBy } from "@/components/ui/form";

/**
 * Demo sign-in.
 *
 * There is no authentication provider and no request leaves the browser: the
 * form checks the fictional credentials locally and records a flag in the demo
 * store. "Use demo account" fills the fields so the credentials stay visible
 * rather than hidden behind a shortcut.
 */
export function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>(
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  const enter = () => {
    signIn();
    router.push("/dashboard");
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Enter the demo email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter the demo password.";

    if (!next.email && !next.password) {
      const matches =
        email.trim().toLowerCase() === demoAccount.email && password === demoAccount.password;
      if (!matches) {
        next.form = "Those aren't the demo credentials. Use the demo account below.";
      }
    }

    setErrors(next);

    const firstInvalid = next.email ? "email" : next.password ? "password" : null;
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#login-${firstInvalid}`)?.focus();
      return;
    }
    if (next.form) return;

    enter();
  };

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field id="login-email" label="Email" required error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined, form: undefined }));
            }}
            autoComplete="username"
            placeholder={demoAccount.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("login-email", undefined, errors.email)}
          />
        </Field>

        <Field id="login-password" label="Password" required error={errors.password}>
          <Input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined, form: undefined }));
            }}
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={describedBy("login-password", undefined, errors.password)}
          />
        </Field>

        {errors.form ? (
          <p role="alert" className="text-[0.8125rem] font-medium text-danger">
            {errors.form}
          </p>
        ) : null}

        <Button type="submit">
          <LogIn aria-hidden="true" className="size-4" />
          Sign in
        </Button>
      </form>

      <div className="border border-line bg-surface-2 p-4">
        <p className="parcel-eyebrow">Demo account (fictional)</p>
        <dl className="mt-2.5 flex flex-col gap-1 text-[0.8125rem]">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-faint">Email</dt>
            <dd className="parcel-numeral text-ink">{demoAccount.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-faint">Password</dt>
            <dd className="parcel-numeral text-ink">{demoAccount.password}</dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEmail(demoAccount.email);
              setPassword(demoAccount.password);
              setErrors({});
            }}
          >
            <KeyRound aria-hidden="true" className="size-3.5" />
            Fill demo credentials
          </Button>
          <Button size="sm" onClick={enter}>
            Enter demo
          </Button>
        </div>
      </div>

      <DemoNotice variant="block">{demoNotices.account}</DemoNotice>
    </div>
  );
}
