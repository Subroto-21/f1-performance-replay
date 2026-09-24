"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { ReactNode } from "react";

type Option = { value: string; label: ReactNode };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className = "",
}: Props) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={`inline-flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-[13px] text-text disabled:opacity-40 hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-text-faint"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="overflow-hidden rounded-md border border-border bg-surface-2 shadow-xl z-50"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1 max-h-72">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center rounded px-2.5 py-1.5 text-[13px] text-text outline-none data-[highlighted]:bg-accent-muted data-[highlighted]:text-text"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
