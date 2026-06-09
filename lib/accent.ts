import type { AccentKey } from "@/config/lists";

/**
 * Monochrome. No accent colors — every "accent" resolves to the same neutral
 * (foreground / border / muted) styling so the UI is plain black & white.
 */
export type AccentClasses = {
  tile: string;
  badge: string;
  glow: string;
  button: string;
  text: string;
  ring: string;
};

const neutral: AccentClasses = {
  tile: "bg-foreground/[0.06] text-foreground",
  badge: "bg-foreground/[0.06] text-foreground",
  glow: "hidden",
  button: "bg-foreground/[0.08] text-foreground hover:bg-foreground/[0.16]",
  text: "text-foreground",
  ring: "focus-visible:ring-foreground/30",
};

export const accentClasses: Record<AccentKey, AccentClasses> = {
  indigo: neutral,
  emerald: neutral,
  rose: neutral,
  amber: neutral,
  sky: neutral,
  violet: neutral,
  teal: neutral,
};
