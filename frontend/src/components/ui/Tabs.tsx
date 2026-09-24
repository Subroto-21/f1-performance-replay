"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { ReactNode } from "react";

export const Tabs = RadixTabs.Root;

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <RadixTabs.List className="flex gap-1 border-b border-border px-1">{children}</RadixTabs.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className="px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-text-muted border-b-2 border-transparent data-[state=active]:text-text data-[state=active]:border-accent hover:text-text transition-colors"
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export const TabsContent = RadixTabs.Content;
