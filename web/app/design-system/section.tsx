import type { ReactNode } from "react";

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function Demo({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      )}
      <div
        className={`rounded-lg border border-border bg-card p-6 flex flex-wrap items-center gap-4 ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ColorSwatch({
  name,
  varName,
  textOn,
}: {
  name: string;
  varName: string;
  textOn?: "background" | "foreground";
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-md border border-border flex items-end p-2"
        style={{ background: `var(${varName})` }}
      >
        <span
          className="text-[10px] font-mono"
          style={{
            color:
              textOn === "foreground"
                ? "var(--foreground)"
                : "var(--muted-foreground)",
          }}
        >
          {varName}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}
