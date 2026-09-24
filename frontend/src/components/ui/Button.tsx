import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-white hover:brightness-110 disabled:opacity-40",
  secondary:
    "bg-surface-2 text-text border border-border hover:bg-surface-hover disabled:opacity-40",
  ghost: "text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-40",
};

const SIZE: Record<Size, string> = {
  sm: "text-[12px] px-2.5 py-1.5 gap-1.5",
  md: "text-[13px] px-3.5 py-2 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "secondary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
