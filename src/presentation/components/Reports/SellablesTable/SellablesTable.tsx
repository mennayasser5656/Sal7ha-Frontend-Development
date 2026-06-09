"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { TbChartPie2 } from "react-icons/tb";
import type { ReportSellable } from "@/domain/entities/Report";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import styles from "./SellablesTable.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");
const TYPE_FILTERS = ["Services", "Items"];

function formatMoney(value: number): string {
  return `$${numberFormatter.format(value)}`;
}

type SellableType = "service" | "item";
type SellableSortKey = "label" | "units" | "revenue";
type SortDirection = "asc" | "desc";

interface SellableRow {
  key: string;
  label: string;
  type: SellableType;
  units: number;
  delta: number;
  revenue: number;
}

interface SellableColumn {
  key: SellableSortKey;
  label: string;
  render: (row: SellableRow) => ReactNode;
}

function toRows(sellables: ReportSellable[], type: SellableType): SellableRow[] {
  return sellables.map((sellable) => ({
    key: `${type}-${sellable.key}`,
    label: sellable.label,
    type,
    units: sellable.units,
    delta: sellable.delta,
    revenue: sellable.profit.reduce((sum, value) => sum + value, 0),
  }));
}

function sortRows(
  rows: SellableRow[],
  sortKey: SellableSortKey,
  sortDirection: SortDirection,
): SellableRow[] {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortKey === "label") {
      return a.label.localeCompare(b.label) * direction;
    }

    return (a[sortKey] - b[sortKey]) * direction;
  });
}

function buildColumns(): SellableColumn[] {
  return [
    {
      key: "label",
      label: "Service / Item",
      render: (row) => (
        <div className={styles.nameCell}>
          <span>{row.label}</span>
          <span className={styles.typeBadge}>
            {row.type === "service" ? "Service" : "Item"}
          </span>
        </div>
      ),
    },
    {
      key: "units",
      label: "Sold / Done",
      render: (row) => numberFormatter.format(row.units),
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (row) => {
        const isUp = row.delta >= 0;
        return (
          <div className={styles.revenueCell}>
            <span>{formatMoney(row.revenue)}</span>
            <span
              className={`${styles.delta} ${
                isUp ? styles.deltaUp : styles.deltaDown
              }`}
              title={`${isUp ? "Up" : "Down"} vs last period`}
            >
              {isUp ? (
                <FaArrowTrendUp className={styles.deltaArrow} />
              ) : (
                <FaArrowTrendDown className={styles.deltaArrow} />
              )}
              {Math.abs(row.delta).toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];
}

interface SellablesTableProps {
  services: ReportSellable[];
  items: ReportSellable[];
}

export default function SellablesTable({
  services,
  items,
}: SellablesTableProps) {
  const rows = useMemo(
    () => [...toRows(services, "service"), ...toRows(items, "item")],
    [services, items],
  );
  const columns = useMemo(() => buildColumns(), []);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SellableSortKey>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredRows = useMemo(() => {
    if (selectedType === "Services") {
      return rows.filter((row) => row.type === "service");
    }

    if (selectedType === "Items") {
      return rows.filter((row) => row.type === "item");
    }

    return rows;
  }, [rows, selectedType]);

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDirection),
    [filteredRows, sortKey, sortDirection],
  );

  function handleSort(nextKey: SellableSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "label" ? "asc" : "desc");
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>
            <TbChartPie2 />
          </span>
          <h2 className={styles.title}>Services & Items</h2>
          <div className={styles.controls}>
            <Dropdown
              options={TYPE_FILTERS}
              selected={selectedType}
              onSelect={setSelectedType}
              label="Type"
            />
          </div>
        </div>
      </header>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.sortableTh} ${
                    sortKey === column.key ? styles.sortedTh : ""
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className={styles.thContent}>
                    <div className={styles.sortIcons} aria-hidden="true">
                      <IoIosArrowUp
                        className={`${styles.sortIcon} ${
                          sortKey === column.key && sortDirection === "asc"
                            ? styles.sortIconActive
                            : ""
                        }`}
                      />
                      <IoIosArrowDown
                        className={`${styles.sortIcon} ${
                          sortKey === column.key && sortDirection === "desc"
                            ? styles.sortIconActive
                            : ""
                        }`}
                      />
                    </div>
                    {column.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.key}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
