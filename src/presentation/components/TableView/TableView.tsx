"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./TableView.module.css";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
}

interface TableViewProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId: (row: T) => string;
  selectedRows: Set<string>;
  setSelectedRows: (selected: Set<string>) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setPerPage: (value: number) => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T, close: () => void) => React.ReactNode;
}

export default function TableView<T>({
  columns,
  data,
  getRowId,
  selectedRows,
  setSelectedRows,
  currentPage,
  totalPages,
  itemsPerPage,
  setPerPage,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  rowActions,
}: TableViewProps<T>) {
  const [goToPageInput, setGoToPageInput] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = data.length > 0 && data.every((row) => selectedRows.has(getRowId(row)));

  const handleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selectedRows);
      data.forEach((row) => next.delete(getRowId(row)));
      setSelectedRows(next);
    } else {
      const next = new Set(selectedRows);
      data.forEach((row) => next.add(getRowId(row)));
      setSelectedRows(next);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      goToPage(parseInt(goToPageInput));
      setGoToPageInput("");
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const sortIcon = (key: string) => (
    <div className={styles.sortIcons}>
      <IoIosArrowUp
        className={`${styles.sortIcon} ${sortKey === key && sortDirection === "asc" ? styles.sortIconActive : ""}`}
      />
      <IoIosArrowDown
        className={`${styles.sortIcon} ${sortKey === key && sortDirection === "desc" ? styles.sortIconActive : ""}`}
      />
    </div>
  );

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <div className={styles.idColumn}>
                  <input
                    className={styles.checkBox}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </div>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.sortable ? styles.sortableTh : ""} ${sortKey === col.key ? styles.sortedTh : ""}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  {col.sortable ? (
                    <div className={styles.thContent}>
                      {sortIcon(col.key)}
                      {col.label}
                    </div>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {rowActions && <th className={styles.actionColumn}></th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const id = getRowId(row);
              return (
                <tr
                  key={id}
                  className={`${onRowClick ? styles.clickableRow : ""} ${selectedRows.has(id) ? styles.isSelected : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td>
                    <div className={styles.idColumn}>
                      <input
                        className={styles.checkBox}
                        type="checkbox"
                        checked={selectedRows.has(id)}
                        onChange={() => {}}
                        onClick={(e) => handleSelectRow(id, e)}
                      />
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                  {rowActions && (
                    <td className={styles.actionColumn}>
                      <div
                        className={styles.actionWrapper}
                        ref={openActionMenu === id ? actionMenuRef : undefined}
                      >
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(openActionMenu === id ? null : id);
                          }}
                          aria-label="Row actions"
                        >
                          ⋯
                        </button>
                        {openActionMenu === id && (
                          <div className={styles.actionMenu}>
                            {rowActions(row, () => setOpenActionMenu(null))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.chooseNumber}>
          <span>Showing per page</span>
          <input
            type="number"
            value={itemsPerPage}
            onChange={(e) => setPerPage(parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className={styles.pageNumbers}>
          <div className={styles.icon} onClick={goToPreviousPage}>
            <MdKeyboardArrowLeft />
          </div>
          {getPageNumbers().map((page, index) => (
            <div
              key={index}
              className={`${styles.pageNumber} ${page === currentPage ? styles.activePage : ""} ${page === "..." ? styles.dots : ""}`}
              onClick={() => typeof page === "number" && goToPage(page)}
            >
              {page}
            </div>
          ))}
          <div className={styles.icon} onClick={goToNextPage}>
            <MdKeyboardArrowRight />
          </div>
        </div>
        <div className={styles.chooseNumber}>
          <span>Go to page</span>
          <input
            type="text"
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyDown={handleGoToPage}
            placeholder={`1-${totalPages}`}
          />
        </div>
      </div>
    </>
  );
}
