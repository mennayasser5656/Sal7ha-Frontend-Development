import type {
  ApplicationStats,
  ReportPeriod,
  ReportSellable,
} from "@/domain/entities/Report";
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
    services: normalizeSellableSeries(stats.services, pointCount),
    items: normalizeSellableSeries(stats.items, pointCount),
  };
}
