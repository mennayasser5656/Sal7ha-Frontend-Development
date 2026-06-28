"use client";

import { useId, useMemo, useRef, useState } from "react";
import styles from "./ProfitLineChart.module.css";

type ChartPoint = { x: number; y: number };

interface ProfitLineChartProps {
  values: number[];
  labels: string[];
  compact?: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const point0 = points[index - 1] ?? points[index];
    const point1 = points[index];
    const point2 = points[index + 1];
    const point3 = points[index + 2] ?? point2;

    const control1X = point1.x + (point2.x - point0.x) / 6;
    const control1Y = point1.y + (point2.y - point0.y) / 6;
    const control2X = point2.x - (point3.x - point1.x) / 6;
    const control2Y = point2.y - (point3.y - point1.y) / 6;

    path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point2.x} ${point2.y}`;
  }

  return path;
}

function formatMoneyShort(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

function formatMoney(value: number): string {
  return `$${numberFormatter.format(value)}`;
}

function niceNumber(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const fraction = value / magnitude;
  const niceFraction =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

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

export default function ProfitLineChart({
  values,
  labels,
  compact = false,
}: ProfitLineChartProps) {
  const gradientId = `profit-area-${useId().replace(/:/g, "")}`;
  const plotRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { axisMax, ticks } = useMemo(
    () => buildAxis(Math.max(...values, 0)),
    [values],
  );
  const points = useMemo<ChartPoint[]>(() => {
    const count = values.length;
    return values.map((value, index) => ({
      x: count > 0 ? ((index + 0.5) / count) * 100 : 0,
      y: axisMax > 0 ? (1 - value / axisMax) * 100 : 100,
    }));
  }, [values, axisMax]);
  const linePath = useMemo(() => buildSmoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} 100 L ${first.x} 100 Z`;
  }, [linePath, points]);

  function handlePlotMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || values.length === 0) return;

    const x = event.clientX - rect.left;
    setHoveredIndex(
      Math.min(
        values.length - 1,
        Math.max(0, Math.floor((x / rect.width) * values.length)),
      ),
    );
  }

  return (
    <div className={`${styles.chart} ${compact ? styles.chartCompact : ""}`}>
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
        onMouseLeave={() => setHoveredIndex(null)}
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
            role="img"
            aria-label="Profit over time"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
            <path d={areaPath} fill={`url(#${gradientId})`} />
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
                {formatMoney(values[hoveredIndex])}
              </span>
            </>
          )}
        </div>

        <div className={styles.xLabels} aria-hidden="true">
          {values.map((_, index) => (
            <span key={`${labels[index]}-${index}`} className={styles.xLabel}>
              {labels[index]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
