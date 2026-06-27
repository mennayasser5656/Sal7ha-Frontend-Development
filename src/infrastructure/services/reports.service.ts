import type {
  ApplicationStats,
  ReportPeriod,
  ReportSellable,
} from "@/domain/entities/Report";
import { ITEM_NAMES, SERVICE_NAMES } from "@/domain/data/sellable-catalog";
import { apiClient } from "@/infrastructure/api/client";

export const REPORT_PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export interface ReportRange {
  start: Date;
  end: Date | null;
}

const EMPTY_STATS: ApplicationStats = {
  period: "week",
  rangeLabel: "",
  axisLabels: [],
  stats: [],
  services: [],
  items: [],
};

function toApiDate(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function normalizeSellableSeries(
  sellables: ReportSellable[],
  pointCount: number,
): ReportSellable[] {
  return sellables.map((sellable) => {
    if (sellable.profit.length === pointCount) {
      return sellable;
    }

    const profit = new Array<number>(pointCount).fill(0);
    sellable.profit.slice(0, pointCount).forEach((value, index) => {
      profit[index] = value;
    });

    return { ...sellable, profit };
  });
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-");
}

function isTechnicalKey(value: string): boolean {
  const normalized = value.trim();
  return (
    /^[0-9]+$/.test(normalized) ||
    /^[a-f0-9]{24}$/i.test(normalized) ||
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(normalized)
  );
}

function labelFromKey(key: string): string | null {
  if (!key || isTechnicalKey(key)) return null;

  const withoutPrefix = key.replace(/^(service|item|sellable)[:/_-]+/i, "");
  const label = withoutPrefix
    .replace(/[:/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return /[a-z]/i.test(label) ? label : null;
}

function resolveCatalogLabel(
  sellable: ReportSellable,
  catalogNames: string[],
): string {
  const candidates = [sellable.label, sellable.key]
    .map(normalizeText)
    .filter(Boolean);

  const match = catalogNames
    .filter((name) => {
      const normalizedName = normalizeText(name);
      return candidates.some((candidate) => candidate.includes(normalizedName));
    })
    .sort((a, b) => b.length - a.length)[0];

  return match ?? labelFromKey(sellable.key) ?? sellable.label;
}

function previousRevenueFor(sellable: ReportSellable): number {
  const currentRevenue = sellable.profit.reduce((sum, value) => sum + value, 0);
  const multiplier = 1 + sellable.delta / 100;

  return multiplier > 0 ? currentRevenue / multiplier : 0;
}

function aggregateSellables(
  sellables: ReportSellable[],
  pointCount: number,
  kind: "service" | "item",
): ReportSellable[] {
  const catalogNames = kind === "service" ? SERVICE_NAMES : ITEM_NAMES;
  const groups = new Map<
    string,
    ReportSellable & { previousRevenue: number }
  >();

  for (const sellable of normalizeSellableSeries(sellables, pointCount)) {
    const label = resolveCatalogLabel(sellable, catalogNames);
    const key = `${kind}:${slugify(label)}`;
    const existing = groups.get(key);

    if (existing) {
      existing.units += sellable.units;
      existing.previousRevenue += previousRevenueFor(sellable);
      sellable.profit.forEach((value, index) => {
        existing.profit[index] += value;
      });
      continue;
    }

    groups.set(key, {
      ...sellable,
      key,
      label,
      profit: [...sellable.profit],
      previousRevenue: previousRevenueFor(sellable),
    });
  }

  return [...groups.values()].map(({ previousRevenue, ...sellable }) => {
    const currentRevenue = sellable.profit.reduce((sum, value) => sum + value, 0);
    const delta =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    return { ...sellable, delta };
  });
}

export function emptyApplicationStats(period: ReportPeriod): ApplicationStats {
  return { ...EMPTY_STATS, period };
}

export async function getApplicationStats(
  period: ReportPeriod,
  range: ReportRange | null = null,
) {
  const stats = await apiClient<ApplicationStats>("/reports/application-stats", {
    query: {
      period,
      startDate: toApiDate(range?.start),
      endDate: toApiDate(range?.end),
    },
  });
  const pointCount = stats.axisLabels.length;

  return {
    ...stats,
    services: aggregateSellables(stats.services, pointCount, "service"),
    items: aggregateSellables(stats.items, pointCount, "item"),
  };
}
