import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { ExternalLink } from "lucide-react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const tones = {
  ghost: "border-line bg-card text-ink",
  primary: "border-teal bg-teal text-teal-ink",
  gold: "border-gold bg-gold text-gold-ink",
  ok: "border-ok bg-ok text-ok-ink",
} as const;

export function Btn({
  tone = "ghost",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof tones }) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-semibold disabled:opacity-50",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx("rounded-card border border-line bg-card p-4", className)}>
      {children}
    </section>
  );
}

export function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-semibold text-teal"
    >
      <span className="min-w-0 text-left">{children}</span>
      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
    </a>
  );
}

export function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink placeholder:text-muted",
        props.className,
      )}
    />
  );
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted",
        props.className,
      )}
    />
  );
}
