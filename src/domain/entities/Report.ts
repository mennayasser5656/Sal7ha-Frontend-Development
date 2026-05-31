export type ReportPeriod = "week" | "month" | "year";

/** A single headline KPI shown in the top stat cards. */
export interface ReportStat {
  key: string;
  label: string;
  value: number;
  /** Identifier the presentation layer maps to a concrete icon. */
  icon: ReportStatIcon;
  /**
   * Percentage change vs. the previous period (last week/month/year depending
   * on the selected period). Positive = up/green, negative = down/red.
   */
  delta: number;
}

export type ReportStatIcon = "customers" | "bookings" | "revenue" | "cars";

/**
 * A sellable thing (a service or an inventory item) whose profit is tracked
 * over the active period. `profit` holds one value per point on the x-axis
 * (e.g. one per day for the "week" period), aligned with `axisLabels`.
 */
export interface ReportSellable {
  key: string;
  label: string;
  profit: number[];
}

/** Everything the Application stats card needs for a given period. */
export interface ApplicationStats {
  period: ReportPeriod;
  /** Human readable range label, e.g. "Apr 15 - Apr 21". */
  rangeLabel: string;
  /** X-axis labels, aligned with each sellable's profit series. */
  axisLabels: string[];
  stats: ReportStat[];
  services: ReportSellable[];
  items: ReportSellable[];
}
