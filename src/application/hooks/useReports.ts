import { useEffect, useMemo, useState } from "react";
import type { ReportPeriod, ReportSellable } from "@/domain/entities/Report";
import {
  emptyApplicationStats,
  getApplicationStats,
  REPORT_PERIODS,
  type ReportRange,
} from "@/infrastructure/services/reports.service";

export function useReports() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [dateRange, setDateRange] = useState<ReportRange | null>(null);
  const [stats, setStats] = useState(() => emptyApplicationStats("week"));
  const [isLoading, setIsLoading] = useState(true);

  // The picked range and the bucket unit together drive everything: the range
  // label, the x-axis buckets, and the bar values all reframe around them.
  const startTime = dateRange?.start.getTime() ?? 0;
  const endTime = dateRange?.end?.getTime() ?? 0;

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      setIsLoading(true);
      try {
        const response = await getApplicationStats(period, dateRange);
        if (!ignore) {
          setStats(response);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startTime, endTime]);

  const rangeLabel = stats.rangeLabel;

  // Default to everything selected, so the chart opens on total money made.
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const serviceKeys = SERVICE_AND_ITEM_KEYS(stats.services);
    const itemKeys = SERVICE_AND_ITEM_KEYS(stats.items);
    setSelectedServices((current) => {
      const next = current.filter((key) => serviceKeys.includes(key));
      return next.length ? next : serviceKeys;
    });
    setSelectedItems((current) => {
      const next = current.filter((key) => itemKeys.includes(key));
      return next.length ? next : itemKeys;
    });
  }, [stats.items, stats.services]);

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
    isLoading,
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
