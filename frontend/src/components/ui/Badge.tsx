import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  color?: string; // hex, used for border/text/bg tint
};

export function Badge({ color, className = "", style, children, ...props }: Props) {
  const tinted = color
    ? {
        color,
        borderColor: `${color}55`,
        background: `${color}18`,
      }
    : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${
        color ? "" : "bg-surface-2 text-text-muted border-border"
      } ${className}`}
      style={{ ...tinted, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
