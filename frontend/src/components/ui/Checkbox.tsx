"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: string;
};

export function Checkbox({ checked, onCheckedChange, disabled, color }: Props) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      disabled={disabled}
      className="flex h-4 w-4 items-center justify-center rounded border border-border-strong bg-surface-2 data-[state=checked]:border-transparent data-[state=checked]:bg-accent disabled:opacity-30"
      style={checked && color ? { background: color, borderColor: color } : undefined}
    >
      <RadixCheckbox.Indicator>
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
