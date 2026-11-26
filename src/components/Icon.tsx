import type { ReactNode, SVGProps } from 'react'

/** Small stroke icon set drawn on a 24px grid. Kept local so the bundle carries only what is used. */
const PATHS = {
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  'arrow-up': <path d="M12 19V5M6 11l6-6 6 6" />,
  'arrow-down': <path d="M12 5v14M6 13l6 6 6-6" />,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  'map-pin': (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" />
    </>
  ),
  moon: <path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500Z" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.500 6.500l4 4" />,
  eye: (
    <>
      <path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <path d="M3 3l18 18M10.600 5.200A9.700 9.700 0 0 1 12 5c6.500 0 10 7 10 7a17 17 0 0 1-3.300 4.200M6.300 6.300A17 17 0 0 0 2 12s3.500 7 10 7a9.600 9.600 0 0 0 4.300-1M9.900 9.900a3 3 0 0 0 4.200 4.200" />
  ),
  link: (
    <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17.500l9 5 9-5" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.500" />
      <rect x="14" y="3" width="7" height="7" rx="1.500" />
      <rect x="3" y="14" width="7" height="7" rx="1.500" />
      <rect x="14" y="14" width="7" height="7" rx="1.500" />
    </>
  ),
  inbox: <path d="M3 13h5l1.500 3h5L16 13h5M5 5h14l2 8v6H3v-6l2-8Z" />,
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  upload: <path d="M12 16V5M7 9l5-5 5 5M5 20h14" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.500-4.500L4 8M4 4v4h4M4 13a8 8 0 0 0 14.500 4.500L20 16M20 20v-4h-4" />,
  alert: <path d="M12 9v4M12 17h.01M10.300 3.900 2.500 18a2 2 0 0 0 1.700 3h15.600a2 2 0 0 0 1.700-3L13.700 3.900a2 2 0 0 0-3.400 0Z" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof PATHS | 'github' | 'linkedin'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, ...rest }: IconProps) {
  if (name === 'github' || name === 'linkedin') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
        {name === 'github' ? (
          <path d="M12 2a10 10 0 0 0-3.160 19.490c.500.090.680-.220.680-.480v-1.700c-2.780.600-3.370-1.340-3.370-1.340-.450-1.160-1.110-1.470-1.110-1.470-.910-.620.070-.610.070-.610 1 .070 1.530 1.030 1.530 1.030.890 1.530 2.340 1.090 2.910.830.090-.650.350-1.090.630-1.340-2.220-.250-4.550-1.110-4.550-4.940 0-1.090.390-1.980 1.030-2.680-.100-.250-.450-1.270.100-2.650 0 0 .840-.270 2.750 1.020a9.560 9.560 0 0 1 5 0c1.910-1.290 2.750-1.020 2.750-1.020.550 1.380.200 2.400.100 2.650.640.700 1.030 1.590 1.030 2.680 0 3.840-2.340 4.680-4.570 4.930.360.310.680.920.680 1.850v2.740c0 .270.180.580.690.480A10 10 0 0 0 12 2Z" />
        ) : (
          <path d="M4.980 3.500a2.500 2.500 0 1 1 0 5 2.500 2.500 0 0 1 0-5ZM3 9.750h4V21H3V9.750Zm6.500 0h3.830v1.540h.050c.530-1.010 1.840-2.070 3.780-2.070 4.050 0 4.790 2.660 4.790 6.120V21h-4v-5.010c0-1.200-.020-2.730-1.660-2.730-1.670 0-1.920 1.300-1.920 2.650V21h-4V9.750Z" />
        )}
      </svg>
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
