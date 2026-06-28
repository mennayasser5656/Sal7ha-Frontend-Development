"use client";

import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { LuCalendarCheck, LuCar } from "react-icons/lu";
import { TbChartPie2, TbCurrencyDollar } from "react-icons/tb";
import type {
  ReportPeriod,
  ReportSellable,
  ReportStatIcon,
} from "@/domain/entities/Report";
import { useReports } from "@/application/hooks/useReports";
import DateActionButton from "@/presentation/components/DateActionButton/DateActionButton";
import MultiSelectDropdown, {
  MultiSelectOption,
} from "@/presentation/components/MultiSelectDropdown/MultiSelectDropdown";
import ProfitLineChart from "@/presentation/components/Reports/ProfitLineChart/ProfitLineChart";
import SellablesTable from "@/presentation/components/Reports/SellablesTable/SellablesTable";
import styles from "./ApplicationStats.module.css";

const STAT_ICONS: Record<ReportStatIcon, React.ReactNode> = {
  customers: <FiUsers />,
  bookings: <LuCalendarCheck />,
  revenue: <TbCurrencyDollar />,
  cars: <LuCar />,
};

const PERIOD_COMPARISON: Record<ReportPeriod, string> = {
  week: "vs last week",
  month: "vs last month",
  year: "vs last year",
};

const numberFormatter = new Intl.NumberFormat("en-US");

function formatMoney(value: number): string {
  return `$${numberFormatter.format(value)}`;
}

function toOptions(sellables: ReportSellable[]): MultiSelectOption[] {
  return sellables.map((sellable) => ({
    value: sellable.key,
    label: sellable.label,
  }));
}

export default function ApplicationStats() {
  const {
    periods,
    period,
    setPeriod,
    dateRange,
    setDateRange,
    rangeLabel,
    stats,
    services,
    items,
    selectedServices,
    setSelectedServices,
    selectedItems,
    setSelectedItems,
    profitSeries,
    totalProfit,
  } = useReports();

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>
            <TbChartPie2 />
          </span>
          <h2 className={styles.title}>Application stats</h2>
          <span className={styles.range}>{rangeLabel}</span>
        </div>

        <div className={styles.controls}>
          <DateActionButton range={dateRange} onRangeChange={setDateRange} />

          <span className={styles.controlsSeparator} aria-hidden="true" />

          <div
            className={styles.periodToggle}
            role="tablist"
            aria-label="Stats period"
          >
            {periods.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={option.key === period}
                className={`${styles.periodBtn} ${
                  option.key === period ? styles.periodBtnActive : ""
                }`}
                onClick={() => setPeriod(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.stats}>
        {stats.stats.map((stat) => {
          const isUp = stat.delta >= 0;
          return (
            <div key={stat.key} className={styles.statCard}>
              <div className={styles.statValueRow}>
                <span className={styles.statValue}>
                  {numberFormatter.format(stat.value)}
                </span>
                <span
                  className={`${styles.statDelta} ${
                    isUp ? styles.statDeltaUp : styles.statDeltaDown
                  }`}
                  title={`${isUp ? "Higher" : "Lower"} ${PERIOD_COMPARISON[period]}`}
                >
                  {isUp ? (
                    <FaArrowTrendUp className={styles.statDeltaArrow} />
                  ) : (
                    <FaArrowTrendDown className={styles.statDeltaArrow} />
                  )}
                  {Math.abs(stat.delta).toFixed(1)}%
                </span>
              </div>
              <span className={styles.statLabel}>
                <span className={styles.statIcon}>{STAT_ICONS[stat.icon]}</span>
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.chartPanel}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <MultiSelectDropdown
              label="Services"
              options={toOptions(services)}
              selected={selectedServices}
              onChange={setSelectedServices}
            />
            <MultiSelectDropdown
              label="Items"
              options={toOptions(items)}
              selected={selectedItems}
              onChange={setSelectedItems}
            />
          </div>
          <div className={styles.total}>
            <span className={styles.totalValue}>{formatMoney(totalProfit)}</span>
            <span className={styles.totalLabel}>profit · {rangeLabel}</span>
          </div>
        </div>

        <ProfitLineChart values={profitSeries} labels={stats.axisLabels} />
      </div>

      <SellablesTable services={services} items={items} />
    </section>
  );
}
