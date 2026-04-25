"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import styles from "./payments.module.css";
import { RiSearch2Line } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import PaymentsTableView, { Payment } from "@/presentation/components/payments/PaymentsTableView/PaymentsTableView";
import { useClickOutside } from "@/application/hooks/useClickOutside";

const STATUS_FILTERS = ["Paid", "Pending", "Refunded", "Failed"];

const MOCK_PAYMENTS: Payment[] = [
  { id: "PAY-8821", customer: "Ali Hassan", service: "Wheel alignment", method: "visa", methodDetail: "4242", date: "Apr 24, 2026", amount: 65, status: "Paid" },
  { id: "PAY-8828", customer: "Mariam Saleh", service: "Engine diagnostics", method: "mada", methodDetail: "1234", date: "Apr 23, 2026", amount: 120, status: "Paid" },
  { id: "PAY-8819", customer: "Omar Faisal", service: "Body & Paint", method: "bank", methodDetail: "", date: "Apr 22, 2026", amount: 350, status: "Pending" },
  { id: "PAY-8818", customer: "Lina Abdullah", service: "Battery replacement", method: "cash", methodDetail: "", date: "Apr 21, 2026", amount: 85, status: "Paid" },
  { id: "PAY-8817", customer: "Yusuf Malik", service: "Tire rotation", method: "visa", methodDetail: "9910", date: "Apr 19, 2026", amount: 45, status: "Refunded" },
  { id: "PAY-8816", customer: "Sara Al-Zahra", service: "Oil change", method: "mada", methodDetail: "3301", date: "Apr 18, 2026", amount: 50, status: "Failed" },
  { id: "PAY-8815", customer: "Hassan Mohamed", service: "Wheel alignment", method: "cash", methodDetail: "", date: "Apr 17, 2026", amount: 65, status: "Paid" },
  { id: "PAY-8814", customer: "Menna Yasser", service: "Engine diagnostics", method: "bank", methodDetail: "", date: "Apr 16, 2026", amount: 120, status: "Pending" },
];

function PaymentActionsDropdown({ count, onRefund, onMarkPaid }: { count: number; onRefund: () => void; onMarkPaid: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  if (count === 0) return null;

  return (
    <div className={styles.actionsWrapper} ref={ref}>
      <button className={styles.actionsBtn} onClick={() => setOpen(!open)}>
        <span>Actions</span>
        <span className={styles.actionsBadge}>{count}</span>
        <IoIosArrowDown className={`${styles.actionsArrow} ${open ? styles.actionsArrowOpen : ""}`} />
      </button>
      {open && (
        <div className={styles.actionsMenu}>
          <button className={styles.actionsMenuItem} onClick={() => { onMarkPaid(); setOpen(false); }}>Mark as Paid</button>
          <button className={styles.actionsMenuItem} onClick={() => { onRefund(); setOpen(false); }}>Refund</button>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredPayments = useMemo(() => {
    return MOCK_PAYMENTS.filter((p) => {
      if (selectedStatus && p.status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.customer.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedStatus, searchQuery]);

  const collected = MOCK_PAYMENTS.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const paidCount = MOCK_PAYMENTS.filter((p) => p.status === "Paid").length;
  const pending = MOCK_PAYMENTS.filter((p) => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
  const revenue = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSetPerPage = (v: number) => {
    setItemsPerPage(v);
    setCurrentPage(1);
  };

  return (
    <div className={styles.section}>
      <h1 className={styles.title}>Payments</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>COLLECTED</span>
          <span className={styles.cardAmount}>${collected}</span>
          <span className={styles.cardSub}>from {paidCount} payments</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>PENDING</span>
          <span className={styles.cardAmount}>${pending}</span>
          <span className={styles.cardSub}>awaiting settlement</span>
        </div>
        <div className={`${styles.card} ${styles.cardDark}`}>
          <span className={styles.cardLabel}>REVENUE THIS MONTH</span>
          <span className={styles.cardAmount}>${revenue}</span>
          <span className={styles.cardSub}>All statuses</span>
        </div>
      </div>

      <div className={styles.tools}>
        <div className={styles.toolsLeft}>
          <Dropdown
            options={STATUS_FILTERS}
            selected={selectedStatus}
            onSelect={setSelectedStatus}
            label="Status"
          />
          <div className={styles.searchBar}>
            <RiSearch2Line />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.toolsRight}>
          <PaymentActionsDropdown
            count={selectedPayments.size}
            onRefund={() => setSelectedPayments(new Set())}
            onMarkPaid={() => setSelectedPayments(new Set())}
          />
          <button className={styles.exportBtn}>Export</button>
        </div>
      </div>

      <PaymentsTableView
        payments={paginatedPayments}
        selectedPayments={selectedPayments}
        setSelectedPayments={setSelectedPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setPerPage={handleSetPerPage}
        goToPage={setCurrentPage}
        goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}