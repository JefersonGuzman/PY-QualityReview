import type { ButtonHTMLAttributes, ReactNode } from "react";
import { scoreLabel } from "@/lib/domain/review";
import { ROLE_LABELS, type Role } from "@/lib/domain/types";

// UI primitives from DESIGN.md "Components". Tokens only; no raw palette classes.

export const FOCUS = "focus-visible:shadow-focus focus-visible:outline-none";

type ButtonVariant = "primary" | "secondary" | "ghost";

const BUTTON_BASE =
  `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium ` +
  `transition-[background-color,border-color,box-shadow] duration-150 ease-out ${FOCUS} ` +
  `disabled:pointer-events-none disabled:bg-surface-muted disabled:text-subtle disabled:shadow-none`;

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink shadow-card hover:bg-ink-hover active:bg-ink-active",
  secondary: "border border-border-strong bg-surface text-foreground shadow-card hover:bg-surface-muted",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
};

export function buttonClass(variant: ButtonVariant = "secondary"): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]}`;
}

export function Button({
  variant = "secondary",
  type = "button",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`.trim()} {...props} />;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-[28px] leading-9 font-semibold">{children}</h1>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl leading-7 font-semibold">{children}</h2>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 shadow-card ${className}`.trim()}>{children}</div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-6 py-12 text-center text-muted">{message}</p>;
}

const PILL = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";

export function RoleBadge({ role }: { role: Role }) {
  const style = role === "team_lead" ? "border border-ink" : "border border-border bg-surface-muted";
  return <span className={`${PILL} ${style} text-foreground`}>{ROLE_LABELS[role]}</span>;
}

export function StatusBadge({ reviewed }: { reviewed: boolean }) {
  return reviewed ? (
    <span className={`${PILL} bg-ink text-on-ink`}>
      <span aria-hidden="true">✓</span>
      Reviewed
    </span>
  ) : (
    <span className={`${PILL} border border-border-strong text-muted`}>Pending</span>
  );
}

// DESIGN.md "Review score": number, label and a decorative five-dot meter.
export function Score({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="font-semibold">
        {score} · {scoreLabel(score)}
      </span>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span key={dot} className={`h-2 w-2 rounded-full ${dot <= score ? "bg-ink" : "bg-border-strong"}`} />
        ))}
      </span>
    </span>
  );
}

export function IssueTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[13px] leading-[18px]">
      {children}
    </span>
  );
}

// DESIGN.md inline message: muted fill with a 3px ink leading bar; the words carry the meaning.
export function InlineMessage({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-lg border-l-[3px] border-ink bg-surface-muted px-3 py-2">
      {children}
    </p>
  );
}
