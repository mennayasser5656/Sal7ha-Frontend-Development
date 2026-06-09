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

/** A plotted point in the chart's 0–100 coordinate space. */
type ChartPoint = { x: number; y: number };

/**
 * Builds a smooth (Catmull-Rom → cubic bézier) path through the points so the
 * line curves gently between values instead of zig-zagging.
 */
function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return "";
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

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

  // Project each value into the chart's 0–100 space. Points sit at the centre
  // of their column so they line up with the x-axis labels below.
  const points = useMemo<ChartPoint[]>(() => {
    const count = profitSeries.length;
    return profitSeries.map((value, index) => ({
      x: count > 0 ? ((index + 0.5) / count) * 100 : 0,
      y: axisMax > 0 ? (1 - value / axisMax) * 100 : 100,
    }));
  }, [profitSeries, axisMax]);

  const linePath = useMemo(() => buildSmoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (points.length === 0) {
      return "";
    }
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} 100 L ${first.x} 100 Z`;
  }, [linePath, points]);

  const plotRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function handlePlotMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || profitSeries.length === 0) {
      return;
    }
    // Snap to whichever point the cursor is nearest, then show its marker.
    const x = event.clientX - rect.left;
    const index = Math.min(
      profitSeries.length - 1,
      Math.max(0, Math.floor((x / rect.width) * profitSeries.length)),
    );
    setHoveredIndex(index);
  }

  function handlePlotLeave() {
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
            <div className={styles.plotArea}>
              <div className={styles.grid} aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick} className={styles.gridLine} />
                ))}
              </div>

              <svg
                className={styles.lineChart}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--selective-yellow)"
                      stopOpacity="0.28"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--selective-yellow)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#profitArea)" />
                <path
                  d={linePath}
                  className={styles.lineStroke}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {hoveredIndex !== null && points[hoveredIndex] && (
                <>
                  <span
                    className={styles.pointGuide}
                    style={{ left: `${points[hoveredIndex].x}%` }}
                  />
                  <span
                    className={styles.point}
                    style={{
                      left: `${points[hoveredIndex].x}%`,
                      top: `${points[hoveredIndex].y}%`,
                    }}
                  />
                  <span
                    className={styles.pointTooltip}
                    style={{
                      left: `${points[hoveredIndex].x}%`,
                      top: `${points[hoveredIndex].y}%`,
                    }}
                  >
                    {formatMoney(profitSeries[hoveredIndex])}
                  </span>
                </>
              )}
            </div>

            <div className={styles.xLabels} aria-hidden="true">
              {profitSeries.map((_, index) => (
                <span key={stats.axisLabels[index]} className={styles.xLabel}>
                  {stats.axisLabels[index]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SellablesTable services={services} items={items} />
    </section>
  );
}
