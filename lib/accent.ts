import type { AccentKey } from "@/config/lists";

/**
 * Each accent is a set of *literal* Tailwind class strings. They must be
 * written out in full (not built by string concatenation) so Tailwind's
 * scanner can see and emit them.
 */
export type AccentClasses = {
  /** Icon tile background + foreground. */
  tile: string;
  /** Category badge. */
  badge: string;
  /** Soft glow behind the card header. */
  glow: string;
  /** Primary (download) button. */
  button: string;
  /** Text accent for emphasis. */
  text: string;
  /** Focus ring. */
  ring: string;
};

export const accentClasses: Record<AccentKey, AccentClasses> = {
  indigo: {
    tile: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300",
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
    glow: "bg-indigo-500/20",
    button:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25",
    text: "text-indigo-600 dark:text-indigo-300",
    ring: "focus-visible:ring-indigo-500/60",
  },
  emerald: {
    tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    glow: "bg-emerald-500/20",
    button:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "focus-visible:ring-emerald-500/60",
  },
  rose: {
    tile: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
    glow: "bg-rose-500/20",
    button: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25",
    text: "text-rose-600 dark:text-rose-300",
    ring: "focus-visible:ring-rose-500/60",
  },
  amber: {
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    glow: "bg-amber-500/20",
    button: "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/25",
    text: "text-amber-600 dark:text-amber-300",
    ring: "focus-visible:ring-amber-500/60",
  },
  sky: {
    tile: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    glow: "bg-sky-500/20",
    button: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25",
    text: "text-sky-600 dark:text-sky-300",
    ring: "focus-visible:ring-sky-500/60",
  },
  violet: {
    tile: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    badge: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    glow: "bg-violet-500/20",
    button:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25",
    text: "text-violet-600 dark:text-violet-300",
    ring: "focus-visible:ring-violet-500/60",
  },
  teal: {
    tile: "bg-teal-500/12 text-teal-600 dark:text-teal-300",
    badge: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
    glow: "bg-teal-500/20",
    button: "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/25",
    text: "text-teal-600 dark:text-teal-300",
    ring: "focus-visible:ring-teal-500/60",
  },
};
