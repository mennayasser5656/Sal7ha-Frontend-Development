import { useMemo, useState } from "react";
import type { ReportPeriod, ReportSellable } from "@/domain/entities/Report";
import {
  getApplicationStats,
  REPORT_PERIODS,
  type ReportRange,
} from "@/infrastructure/services/reports.service";

export function useReports() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [dateRange, setDateRange] = useState<ReportRange | null>(null);

  // The picked range and the bucket unit together drive everything: the range
  // label, the x-axis buckets, and the bar values all reframe around them.
  const startTime = dateRange?.start.getTime() ?? 0;
  const endTime = dateRange?.end?.getTime() ?? 0;

  const stats = useMemo(
    () => getApplicationStats(period, dateRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, startTime, endTime],
  );

  const rangeLabel = stats.rangeLabel;

  // Default to everything selected, so the chart opens on total money made.
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    SERVICE_AND_ITEM_KEYS(getApplicationStats("week").services),
  );
  const [selectedItems, setSelectedItems] = useState<string[]>(() =>
    SERVICE_AND_ITEM_KEYS(getApplicationStats("week").items),
  );

  // Combined profit per x-axis point across every selected service and item.
  const profitSeries = useMemo(() => {
    const points = stats.axisLabels.length;
    const totals = new Array<number>(points).fill(0);

    addSelectedProfit(totals, stats.services, selectedServices);
    addSelectedProfit(totals, stats.items, selectedItems);

    return totals;
  }, [stats, selectedServices, selectedItems]);

  const totalProfit = useMemo(
    () => profitSeries.reduce((sum, value) => sum + value, 0),
    [profitSeries],
  );

  return {
    periods: REPORT_PERIODS,
    period,
    setPeriod,
    dateRange,
    setDateRange,
    rangeLabel,
    stats,
    services: stats.services,
    items: stats.items,
    selectedServices,
    setSelectedServices,
    selectedItems,
    setSelectedItems,
    profitSeries,
    totalProfit,
  };
}

function SERVICE_AND_ITEM_KEYS(sellables: ReportSellable[]): string[] {
  return sellables.map((sellable) => sellable.key);
}

function addSelectedProfit(
  totals: number[],
  sellables: ReportSellable[],
  selectedKeys: string[],
) {
  for (const sellable of sellables) {
    if (!selectedKeys.includes(sellable.key)) {
      continue;
    }
    sellable.profit.forEach((value, index) => {
      totals[index] += value;
    });
  }
}
