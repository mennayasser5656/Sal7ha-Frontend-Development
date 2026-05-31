"use client";

import { useMemo, useRef, useState } from "react";
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

/** Height of the x-axis label strip below the bars (matches `.barLabel` in CSS). */
const X_LABEL_AREA_PX = 22;

/** Compact money for axis ticks, e.g. $1.2k. */
function formatMoneyShort(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

function formatMoney(value: number): string {
  return `$${numberFormatter.format(value)}`;
}

/** Rounds a value to a "nice" number (1, 2, 5 × 10ⁿ) for readable axis steps. */
function niceNumber(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const fraction = value / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

/**
 * Builds an evenly stepped axis from $0 up to a rounded max, so ticks are
 * always clean round numbers (0, 50, 100, …) and never collapse to "1, 1, 0".
 */
function buildAxis(maxValue: number): { axisMax: number; ticks: number[] } {
  if (maxValue <= 0) {
    return { axisMax: 100, ticks: [100, 50, 0] };
  }
  const step = niceNumber(maxValue / 4);
  const axisMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let tick = axisMax; tick >= 0; tick -= step) {
    ticks.push(tick);
  }
  return { axisMax, ticks };
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

  const { axisMax, ticks } = useMemo(
    () => buildAxis(Math.max(...profitSeries, 0)),
    [profitSeries],
  );

  const plotRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ y: number; value: number } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function handlePlotMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    // Free-moving crosshair: track the cursor's height and read off its value.
    // The bottom strip is reserved for the x-axis labels, so bars rise above it.
    const chartHeight = rect.height - X_LABEL_AREA_PX;
    const y = Math.max(0, Math.min(event.clientY - rect.top, chartHeight));
    const value = axisMax * (1 - y / chartHeight);

    // Which column the cursor is currently over (for that column's own label).
    const x = event.clientX - rect.left;
    const index = Math.min(
      profitSeries.length - 1,
      Math.max(0, Math.floor((x / rect.width) * profitSeries.length)),
    );

    setHover({ y, value });
    setHoveredIndex(index);
  }

  function handlePlotLeave() {
    setHover(null);
    setHoveredIndex(null);
  }

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

        <div className={styles.chart}>
          <div className={styles.yAxis} aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className={styles.yTick}>
                {formatMoneyShort(tick)}
              </span>
            ))}
          </div>

          <div
            className={styles.plot}
            ref={plotRef}
            onMouseMove={handlePlotMove}
            onMouseLeave={handlePlotLeave}
          >
            <div className={styles.grid} aria-hidden="true">
              {ticks.map((tick) => (
                <span key={tick} className={styles.gridLine} />
              ))}
            </div>

            {hover && (
              <div className={styles.crosshair} style={{ top: hover.y }}>
                <span className={styles.crosshairValue}>
                  {formatMoney(hover.value)}
                </span>
              </div>
            )}

            <div className={styles.bars}>
              {profitSeries.map((value, index) => (
                <div key={stats.axisLabels[index]} className={styles.barColumn}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(value / axisMax) * 100}%` }}
                  >
                    {hoveredIndex === index && (
                      <span className={styles.barTooltip}>
                        {formatMoney(value)}
                      </span>
                    )}
                  </div>
                  <span className={styles.barLabel}>{stats.axisLabels[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
