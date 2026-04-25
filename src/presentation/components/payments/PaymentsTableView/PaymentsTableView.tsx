"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./PaymentsTableView.module.css";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { BsCreditCard2Front, BsBank } from "react-icons/bs";

export interface Payment {
  id: string;
  customer: string;
  service: string;
  method: "visa" | "mada" | "bank" | "cash";
  methodDetail: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
}

interface PaymentsTableViewProps {
  payments: Payment[];
  selectedPayments: Set<string>;
  setSelectedPayments: (selected: Set<string>) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setPerPage: (value: number) => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const STATUS_CLASS: Record<Payment["status"], string> = {
  Paid: styles.statusPaid,
  Pending: styles.statusPending,
  Refunded: styles.statusRefunded,
  Failed: styles.statusFailed,
};

function MethodCell({ method, detail }: { method: Payment["method"]; detail: string }) {
  if (method === "visa") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconVisa}`}>
          <BsCreditCard2Front />
        </span>
        <span>Visa {detail && `•••• ${detail}`}</span>
      </div>
    );
  }
  if (method === "mada") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconMada}`}>
          <BsCreditCard2Front />
        </span>
        <span>Mada {detail && `•••• ${detail}`}</span>
      </div>
    );
  }
  if (method === "bank") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconBank}`}>
          <BsBank />
        </span>
        <span>Bank Transfer</span>
      </div>
    );
  }
  return (
    <div className={styles.methodCell}>
      <span className={styles.cashDot} />
      <span>Cash</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  return (
    <span className={`${styles.statusBadge} ${STATUS_CLASS[status]}`}>
      <span className={styles.statusDot} />
      {status}
    </span>
  );
}

export default function PaymentsTableView({
  payments,
  selectedPayments,
  setSelectedPayments,
  currentPage,
  totalPages,
  itemsPerPage,
  setPerPage,
  goToPage,
  goToPreviousPage,
  goToNextPage,
}: PaymentsTableViewProps) {
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

  const allSelected = payments.length > 0 && payments.every((p) => selectedPayments.has(p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selectedPayments);
      payments.forEach((p) => next.delete(p.id));
      setSelectedPayments(next);
    } else {
      const next = new Set(selectedPayments);
      payments.forEach((p) => next.add(p.id));
      setSelectedPayments(next);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedPayments);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPayments(next);
  };

  const handleActionClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionMenu(openActionMenu === id ? null : id);
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
              <th>PAYMENT ID</th>
              <th>CUSTOMER</th>
              <th>SERVICE</th>
              <th>METHOD</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th className={styles.actionColumn}></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className={`${styles.clickableRow} ${selectedPayments.has(payment.id) ? styles.isSelected : ""}`}
              >
                <td>
                  <div className={styles.idColumn}>
                    <input
                      className={styles.checkBox}
                      type="checkbox"
                      checked={selectedPayments.has(payment.id)}
                      onChange={() => {}}
                      onClick={(e) => handleSelectRow(payment.id, e)}
                    />
                  </div>
                </td>
                <td>
                  <span className={styles.paymentId}>{payment.id}</span>
                </td>
                <td>
                  <span className={styles.customerName}>{payment.customer}</span>
                </td>
                <td>
                  <span className={styles.serviceName}>{payment.service}</span>
                </td>
                <td>
                  <MethodCell method={payment.method} detail={payment.methodDetail} />
                </td>
                <td>{payment.date}</td>
                <td>${payment.amount}</td>
                <td>
                  <StatusBadge status={payment.status} />
                </td>
                <td className={styles.actionColumn}>
                  <div className={styles.actionWrapper} ref={openActionMenu === payment.id ? actionMenuRef : undefined}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => handleActionClick(payment.id, e)}
                      aria-label="Row actions"
                    >
                      ⋯
                    </button>
                    {openActionMenu === payment.id && (
                      <div className={styles.actionMenu}>
                        <button
                          className={styles.actionMenuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                          }}
                        >
                          View Details
                        </button>
                        <button
                          className={styles.actionMenuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                          }}
                        >
                          Refund
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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