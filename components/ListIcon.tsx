import {
  CalendarClock,
  HeartPulse,
  Compass,
  Store,
  Users,
  Briefcase,
  Globe,
  Building2,
  Hotel,
  Table2,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/config/lists";

const MAP: Record<IconKey, LucideIcon> = {
  calendar: CalendarClock,
  health: HeartPulse,
  compass: Compass,
  store: Store,
  users: Users,
  briefcase: Briefcase,
  globe: Globe,
  building: Building2,
  hotel: Hotel,
  table: Table2,
};

export function ListIcon({
  name,
  className,
}: {
  name?: IconKey;
  className?: string;
}) {
  const Cmp = (name && MAP[name]) || Table2;
  return <Cmp className={className} strokeWidth={1.75} aria-hidden="true" />;
}
