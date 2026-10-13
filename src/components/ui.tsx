import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FreshnessTone } from "../types";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative max-h-[88dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-[18px] border-t-[1.5px] border-ink bg-ground p-5 pb-10 outline-none lg:mb-8 lg:rounded-[14px] lg:border-[1.5px]"
      >
        <div className="mx-auto h-1 w-12 rounded-full bg-ink/25 lg:hidden" />
        {children}
      </div>
    </div>
  );
}

const TAG_TONE: Record<FreshnessTone, string> = {
  "use-now": "bg-tag-red text-white",
  soon: "bg-tag-orange text-white",
  good: "bg-tag-canary text-ink",
  fresh: "bg-tag-green text-white",
};

export function EveningTag({
  top,
  bottom,
  tone = "good",
  size = "md",
  pop,
  className = "",
}: {
  top: string;
  bottom: string;
  tone?: FreshnessTone;
  size?: "sm" | "md";
  pop?: boolean;
  className?: string;
}) {
  const burst = tone === "use-now";
  const dimension = size === "sm" ? "h-14 w-14" : "h-[72px] w-[72px]";
  return (
    <div
      className={`${TAG_TONE[tone]} ${
        burst ? "tag-burst" : "rounded-full"
      } ${dimension} ${pop ? "tag-pop" : "-rotate-6"} shadow-sticker flex flex-col items-center justify-center text-center ${
        burst ? "px-3" : "px-1.5"
      } ${className}`}
    >
      <span className="text-[9px] font-bold uppercase leading-none tracking-[0.1em]">{top}</span>
      <span className="tabular mt-1 font-mono text-[12px] font-bold uppercase leading-none">
        {bottom}
      </span>
    </div>
  );
}

export function PackageCard({
  children,
  className = "",
  tab,
  tag,
  raised,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  tab?: string;
  tag?: ReactNode;
  raised?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-[10px] bg-card ${
        raised ? "shadow-tag" : "border border-rule"
      } ${onClick ? "cursor-pointer transition active:translate-y-px" : ""} ${className}`}
    >
      {tab ? (
        <span className="absolute -top-2 left-3 z-[1] rounded-[4px] bg-ink px-2 py-0.5 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-ground">
          {tab}
        </span>
      ) : null}
      {tag ? <div className="absolute -right-2 -top-3 z-[2]">{tag}</div> : null}
      {children}
    </div>
  );
}

export function ShelfStrip({
  children,
  guide,
  className = "",
}: {
  children: ReactNode;
  guide?: string;
  className?: string;
}) {
  return (
    <div className={`shelf-rail flex items-end justify-between gap-3 pb-2 ${className}`}>
      <h2 className="text-[19px] font-black uppercase leading-none tracking-[0.02em] text-ink">
        {children}
      </h2>
      {guide ? (
        <span className="tabular font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
          {guide}
        </span>
      ) : null}
    </div>
  );
}

export function TagButton({
  children,
  variant = "primary",
  full,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ink" | "outline" | "quiet" | "danger";
  full?: boolean;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-tag-canary text-ink border-ink hover:bg-tag-canary-deep active:translate-y-px",
    ink: "bg-ink text-ground border-ink hover:bg-black active:translate-y-px",
    outline:
      "bg-card text-ink border-ink hover:bg-ground active:translate-y-px",
    quiet:
      "bg-transparent text-soft border-transparent hover:text-ink hover:border-rule",
    danger:
      "bg-card text-tag-red border-tag-red/50 hover:bg-tag-red/5 active:translate-y-px",
  };
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[8px] border-[1.5px] px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.06em] transition disabled:cursor-not-allowed disabled:border-rule disabled:bg-ground disabled:text-soft ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em] text-soft">
        {label}
        {hint ? (
          <span className="font-mono text-[10px] normal-case tracking-normal">{hint}</span>
        ) : null}
      </span>
      <input
        {...rest}
        className={`w-full rounded-[8px] border border-rule bg-card px-3 py-2.5 text-sm text-ink placeholder:text-soft focus:border-ink focus:outline-none ${className}`}
      />
    </label>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className = "",
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[40px] items-center rounded-[6px] border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition ${
        active
          ? "border-ink bg-ink text-ground"
          : "border-rule bg-card text-soft hover:border-ink hover:text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border border-rule bg-ground px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-soft ${className}`}
    >
      {children}
    </span>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex rounded-[10px] border-[1.5px] border-ink bg-card p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`flex min-h-[40px] flex-1 items-center justify-center rounded-[7px] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] transition ${
            value === option.id ? "bg-ink text-ground" : "text-soft hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressStrip({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-rule/70 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function BackHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border-[1.5px] border-ink bg-card text-ink transition hover:bg-ground active:translate-y-px"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-black uppercase leading-none tracking-[0.02em]">
            {title}
          </h1>
          {subtitle ? <p className="mt-0.5 truncate text-xs text-soft">{subtitle}</p> : null}
        </div>
      </div>
      {right}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-rule bg-card/70 p-8 text-center">
      <span className="text-lg font-black uppercase tracking-[0.04em]">{title}</span>
      <p className="max-w-xs text-sm text-soft">{body}</p>
      {action}
    </div>
  );
}

export function InkStamp({
  on,
  children,
  tone = "green",
}: {
  on: boolean;
  children: ReactNode;
  tone?: "green" | "red" | "ink";
}) {
  const toneClass = !on
    ? "text-soft/50 border-dashed border-soft/30"
    : tone === "red"
      ? "text-tag-red border-tag-red"
      : tone === "ink"
        ? "text-ink border-ink"
        : "text-tag-green border-tag-green";
  return (
    <span
      className={`inline-flex -rotate-6 items-center rounded-[6px] border-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${toneClass}`}
    >
      {children}
    </span>
  );
}
