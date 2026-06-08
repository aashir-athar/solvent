// Solvent icon set. @mindees/icons is the primary in-house source; the finance and
// privacy glyphs it lacks are defined here with the SAME createIcon factory, so the
// whole set stays one cohesive Feather-style system (24x24, single stroke, round caps).

import { createIcon } from '@mindees/icons';

export {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  MinusIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  BellIcon,
  InfoIcon,
  CalendarIcon,
  ClockIcon,
  LockIcon,
  GlobeIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  HelpIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  EyeIcon,
  type IconProps,
} from '@mindees/icons';

// Domain glyphs missing from @mindees/icons, in the identical style.

export const ShieldIcon = createIcon({
  name: 'Shield',
  viewBox: '0 0 24 24',
  path: 'M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z',
});

export const ShieldCheckIcon = createIcon({
  name: 'ShieldCheck',
  viewBox: '0 0 24 24',
  path: 'M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3zM9 11.5l2 2 4-4',
});

export const PhoneKeyholeIcon = createIcon({
  name: 'PhoneKeyhole',
  viewBox: '0 0 24 24',
  path: 'M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM12 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11.4 13h1.2l.5 3h-2.2l.5-3z',
});

export const TargetIcon = createIcon({
  name: 'Target',
  viewBox: '0 0 24 24',
  path: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 13a1 1 0 100-2 1 1 0 000 2z',
});

export const CreditCardIcon = createIcon({
  name: 'CreditCard',
  viewBox: '0 0 24 24',
  path: 'M3 6.5h18a.5.5 0 01.5.5v10a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5zM2.5 10.5h19M6.5 14.5h4',
});

export const TrendingDownIcon = createIcon({
  name: 'TrendingDown',
  viewBox: '0 0 24 24',
  path: 'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
});

export const TrendingUpIcon = createIcon({
  name: 'TrendingUp',
  viewBox: '0 0 24 24',
  path: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
});

export const ReceiptIcon = createIcon({
  name: 'Receipt',
  viewBox: '0 0 24 24',
  path: 'M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8V3.5zM9 8h6M9 12h6M9 16h3.5',
});

export const SparkleIcon = createIcon({
  name: 'Sparkle',
  viewBox: '0 0 24 24',
  path: 'M12 3l1.7 5L19 9.7l-5.3 1.6L12 17l-1.7-5.7L5 9.7l5.3-1.6L12 3z',
});

export const BarChartIcon = createIcon({
  name: 'BarChart',
  viewBox: '0 0 24 24',
  path: 'M5 21V10M12 21V4M19 21v-7M3 21h18',
});

export const PlusCircleIcon = createIcon({
  name: 'PlusCircle',
  viewBox: '0 0 24 24',
  path: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 8.5v7M8.5 12h7',
});
