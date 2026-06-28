"use client";

import { useReports } from "@/application/hooks/useReports";
import type { ReportSellable } from "@/domain/entities/Report";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import MultiSelectDropdown, {
  type MultiSelectOption,
} from "@/presentation/components/MultiSelectDropdown/MultiSelectDropdown";
import ProfitLineChart from "@/presentation/components/Reports/ProfitLineChart/ProfitLineChart";
import styles from "./GrowthWidget.module.css";

function toOptions(sellables: ReportSellable[]): MultiSelectOption[] {
  return sellables.map((sellable) => ({
    value: sellable.key,
    label: sellable.label,
  }));
}

export default function GrowthWidget() {
  const {
    periods,
    period,
    setPeriod,
    stats,
    services,
    items,
    selectedServices,
    setSelectedServices,
    selectedItems,
    setSelectedItems,
    profitSeries,
  } = useReports();
  const selectedPeriod =
    periods.find((option) => option.key === period)?.label ?? null;

  function handlePeriodChange(value: string | null) {
    const nextPeriod = periods.find((option) => option.label === value);
    if (nextPeriod) setPeriod(nextPeriod.key);
  }

  return (
    <section className={styles.widget}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Growth</h2>
        </div>

        <div className={styles.controls}>
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
          <Dropdown
            label="Time"
            options={periods.map((option) => option.label)}
            selected={selectedPeriod}
            onSelect={handlePeriodChange}
            clearable={false}
          />
        </div>
      </header>

      <div className={styles.chartPanel}>
        <ProfitLineChart
          values={profitSeries}
          labels={stats.axisLabels}
          compact
        />
      </div>
    </section>
  );
}
