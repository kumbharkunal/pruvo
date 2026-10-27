import type { SVGProps } from "react";
import {
  IconAirConditioning,
  IconBatteryAutomotive,
  IconCarLifter,
  IconCarSuspension,
  IconEngine,
  IconGasStation,
  IconManualGearbox,
  IconPaint,
  IconPlug,
  IconRadar,
  IconWheel,
} from "@tabler/icons-react";
import type { SystemIcon as SystemIconName } from "@/content/site";

/** One icon family (Tabler, stroke 1.5). The two gaps below are drawn on the same 24px grid. */
export const STROKE = 1.5;

type IconProps = Omit<SVGProps<SVGSVGElement>, "stroke"> & { size?: number; stroke?: number };

function frame({ size = 24, stroke = STROKE, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

/** Brake disc with caliper (no Tabler equivalent). */
export function BrakeDiscIcon(props: IconProps) {
  return frame({
    ...props,
    children: (
      <>
        <circle cx="11" cy="13" r="7.5" />
        <circle cx="11" cy="13" r="2.4" />
        <path d="M11 7.9v.01M15.4 10.45v.01M15.4 15.55v.01M11 18.1v.01M6.6 15.55v.01M6.6 10.45v.01" />
        <path d="M14.6 4.1a9.6 9.6 0 0 1 5.3 5.1" />
        <path d="M16.2 3.2l2.2-.7 1.9 4.3-1.9 1" />
      </>
    ),
  });
}

/** Headlamp with beam (no Tabler equivalent). */
export function HeadlightIcon(props: IconProps) {
  return frame({
    ...props,
    children: (
      <>
        <path d="M11 6c-4.4 0-7 2.7-7 6s2.6 6 7 6c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
        <path d="M16.5 8.5l4-1M16.5 12h4.5M16.5 15.5l4 1" />
      </>
    ),
  });
}

const SYSTEM_ICONS = {
  engine: IconEngine,
  gearbox: IconManualGearbox,
  suspension: IconCarSuspension,
  brake: BrakeDiscIcon,
  tyre: IconWheel,
  cooling: IconAirConditioning,
  fuel: IconGasStation,
  electrics: IconBatteryAutomotive,
  safety: IconRadar,
  paint: IconPaint,
  underbody: IconCarLifter,
  obd: IconPlug,
} as const;

export function SystemIcon({ name, size = 24, className }: { name: SystemIconName; size?: number; className?: string }) {
  const Icon = SYSTEM_ICONS[name] as React.ComponentType<IconProps>;
  return <Icon size={size} stroke={STROKE} className={className} aria-hidden="true" />;
}
