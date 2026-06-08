import type {
  ApplicationStats,
  ReportPeriod,
  ReportSellable,
  ReportStat,
  ReportStatIcon,
} from "@/domain/entities/Report";

export const REPORT_PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

/** Approximate days each bucket spans, used to scale the mock profit. */
const DAYS_PER_BUCKET: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

/** X-axis label prefix per bucket unit, e.g. "W1", "M1", "Y1". */
const BUCKET_PREFIX: Record<ReportPeriod, string> = {
  week: "W",
  month: "M",
  year: "Y",
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface ReportRange {
  start: Date;
  end: Date | null;
}

function formatFull(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Monday of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const dayOffset = (date.getDay() + 6) % 7; // days since Monday
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - dayOffset);
  return monday;
}

/** The bounds of the single week/month/year that `date` falls in. */
function unitBounds(unit: ReportPeriod, date: Date): { start: Date; end: Date } {
  if (unit === "week") {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }
  if (unit === "month") {
    return {
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    };
  }
  return {
    start: new Date(date.getFullYear(), 0, 1),
    end: new Date(date.getFullYear(), 11, 31),
  };
}

/**
 * Resolves the picked range into a concrete [start, end] pair:
 * - no range            → the current week/month/year (the one today is in)
 * - single date, no end → the week/month/year that date falls in
 * - full start..end     → that exact span, divided into `unit` buckets
 */
function resolveRange(
  unit: ReportPeriod,
  range: ReportRange | null,
): { start: Date; end: Date } {
  if (!range) {
    return unitBounds(unit, new Date());
  }
  if (!range.end) {
    return unitBounds(unit, range.start);
  }
  return { start: range.start, end: range.end };
}

/** Number of whole `unit` buckets spanning [start, end] inclusive. */
function countBuckets(start: Date, end: Date, unit: ReportPeriod): number {
  if (unit === "week") {
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return Math.max(1, Math.floor(days / 7) + 1);
  }
  if (unit === "month") {
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Math.max(1, months + 1);
  }
  return Math.max(1, end.getFullYear() - start.getFullYear() + 1);
}

/** Average profit a sellable contributes per day, in dollars. */
const SERVICE_CATALOG: { key: string; label: string; dailyAvg: number }[] = [
  { key: "oil-change", label: "Oil change", dailyAvg: 180 },
  { key: "wheel-alignment", label: "Wheel alignment", dailyAvg: 140 },
  { key: "engine-diagnostics", label: "Engine diagnostics", dailyAvg: 220 },
  { key: "body-paint", label: "Body & Paint", dailyAvg: 320 },
  { key: "brake-service", label: "Brake service", dailyAvg: 160 },
];

const ITEM_CATALOG: { key: string; label: string; dailyAvg: number }[] = [
  { key: "battery", label: "Battery", dailyAvg: 90 },
  { key: "brake-pads", label: "Brake pads", dailyAvg: 70 },
  { key: "tires", label: "Tires", dailyAvg: 150 },
  { key: "engine-oil", label: "Engine oil", dailyAvg: 60 },
  { key: "air-filter", label: "Air filter", dailyAvg: 40 },
];

/**
 * Headline KPIs expressed per single bucket (one week/month/year). The actual
 * card values scale with how many buckets the picked range spans.
 */
const STAT_TEMPLATES: Record<
  ReportPeriod,
  { key: string; label: string; icon: ReportStatIcon; perBucket: number }[]
> = {
  week: [
    { key: "items", label: "Items sold", icon: "customers", perBucket: 1236 },
    { key: "bookings", label: "Bookings made", icon: "bookings", perBucket: 345 },
    { key: "revenue", label: "Revenue", icon: "revenue", perBucket: 16345 },
    { key: "cars", label: "Cars serviced", icon: "cars", perBucket: 268 },
  ],
  month: [
    { key: "items", label: "Items sold", icon: "customers", perBucket: 4820 },
    { key: "bookings", label: "Bookings made", icon: "bookings", perBucket: 1432 },
    { key: "revenue", label: "Revenue", icon: "revenue", perBucket: 68210 },
    { key: "cars", label: "Cars serviced", icon: "cars", perBucket: 1104 },
  ],
  year: [
    { key: "items", label: "Items sold", icon: "customers", perBucket: 15236 },
    { key: "bookings", label: "Bookings made", icon: "bookings", perBucket: 18420 },
    { key: "revenue", label: "Revenue", icon: "revenue", perBucket: 824600 },
    { key: "cars", label: "Cars serviced", icon: "cars", perBucket: 13280 },
  ],
};

/**
 * Builds the stat cards for the selected unit and range. Values are the
 * per-bucket figure × the number of buckets, with a small deterministic wobble
 * so different ranges read distinctly; the delta is a stable ±15% vs. the
 * previous span of the same length.
 */
function buildStats(
  unit: ReportPeriod,
  buckets: number,
  seed: string,
): ReportStat[] {
  return STAT_TEMPLATES[unit].map((template) => {
    const wobble = 0.92 + seededRandom(`${template.key}-${seed}-v`) * 0.16;
    const value = Math.round(template.perBucket * buckets * wobble);
    const delta = Number(
      (seededRandom(`${template.key}-${seed}-d`) * 30 - 15).toFixed(1),
    );
    return {
      key: template.key,
      label: template.label,
      icon: template.icon,
      value,
      delta,
    };
  });
}

/**
 * Builds the card data for a bucket `unit` (week/month/year) spanning the
 * picked `range`. The range is divided into that many buckets — e.g. a 3-month
 * range with the "week" unit yields W1…W12, with "month" yields M1…M3.
 */
export function getApplicationStats(
  unit: ReportPeriod,
  range: ReportRange | null = null,
): ApplicationStats {
  const { start, end } = resolveRange(unit, range);
  const bucketCount = countBuckets(start, end, unit);

  const axisLabels = Array.from(
    { length: bucketCount },
    (_, index) => `${BUCKET_PREFIX[unit]}${index + 1}`,
  );

  // Stable per range + unit, so the chart reshapes when either changes but
  // stays put across re-renders of the same selection.
  const seed = `${start.getTime()}-${end.getTime()}-${unit}`;

  return {
    period: unit,
    rangeLabel: `${formatFull(start)} - ${formatFull(end)}`,
    axisLabels,
    stats: buildStats(unit, bucketCount, seed),
    services: SERVICE_CATALOG.map((entry) =>
      buildSellable(entry, unit, seed, bucketCount),
    ),
    items: ITEM_CATALOG.map((entry) =>
      buildSellable(entry, unit, seed, bucketCount),
    ),
  };
}

function buildSellable(
  entry: { key: string; label: string; dailyAvg: number },
  unit: ReportPeriod,
  seed: string,
  points: number,
): ReportSellable {
  const perBucket = entry.dailyAvg * DAYS_PER_BUCKET[unit];

  const profit = Array.from({ length: points }, (_, index) => {
    // Deterministic ±25% variation so the chart looks lively but is stable.
    const variation =
      0.75 + seededRandom(`${entry.key}-${seed}-${index}`) * 0.5;
    return Math.round((perBucket * variation) / 5) * 5;
  });

  return { key: entry.key, label: entry.label, profit };
}

/** Small deterministic hash → [0, 1) so mock data never shifts between renders. */
function seededRandom(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}
