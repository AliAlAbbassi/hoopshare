import { Download } from "lucide-react";
import clsx from "clsx";

export function DownloadButton({
  id,
  filename,
  accentButton,
  accentRing,
  label = "Download CSV",
  size = "md",
  className,
}: {
  id: string;
  filename?: string;
  /** Accent button classes from accentClasses[...].button */
  accentButton: string;
  /** Accent focus-ring classes from accentClasses[...].ring */
  accentRing: string;
  label?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <a
      href={`/api/download/${id}`}
      download={filename}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-lg transition-[transform,background-color] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        size === "lg" ? "px-5 py-3 text-[15px]" : "px-4 py-2.5 text-sm",
        accentButton,
        accentRing,
        className,
      )}
    >
      <Download className={size === "lg" ? "size-[18px]" : "size-4"} aria-hidden="true" />
      {label}
    </a>
  );
}
