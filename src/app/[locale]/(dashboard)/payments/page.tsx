"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import styles from "./payments.module.css";
import { RiSearch2Line } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { BsCreditCard2Front, BsBank } from "react-icons/bs";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import TableView, { ColumnDef } from "@/presentation/components/TableView/TableView";
import { useClickOutside } from "@/application/hooks/useClickOutside";

const STATUS_FILTERS = ["Paid", "Pending", "Refunded", "Failed"];

interface Payment {
  id: string;
  customer: string;
  service: string;
  method: "visa" | "mada" | "bank" | "cash";
  methodDetail: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
}

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

type PaymentSortKey = "id" | "customer" | "service" | "method" | "date" | "amount" | "status";

const COLUMNS: ColumnDef<Payment>[] = [
  { key: "id", label: "PAYMENT ID", sortable: true, render: (p) => <span className={styles.paymentId}>{p.id}</span> },
  { key: "customer", label: "CUSTOMER", sortable: true, render: (p) => <span className={styles.customerName}>{p.customer}</span> },
  { key: "service", label: "SERVICE", sortable: true, render: (p) => <span className={styles.serviceName}>{p.service}</span> },
  { key: "method", label: "METHOD", sortable: true, render: (p) => <MethodCell method={p.method} detail={p.methodDetail} /> },
  { key: "date", label: "DATE", sortable: true, render: (p) => p.date },
  { key: "amount", label: "AMOUNT", sortable: true, render: (p) => `$${p.amount}` },
  { key: "status", label: "STATUS", sortable: true, render: (p) => <StatusBadge status={p.status} /> },
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
  const [sortKey, setSortKey] = useState<PaymentSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: PaymentSortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

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

  const sortedPayments = useMemo(() => {
    if (!sortKey) return filteredPayments;
    const sorted = [...filteredPayments].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredPayments, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedPayments.length / itemsPerPage));
  const paginatedPayments = sortedPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

      <TableView
        columns={COLUMNS}
        data={paginatedPayments}
        getRowId={(p) => p.id}
        selectedRows={selectedPayments}
        setSelectedRows={setSelectedPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setPerPage={handleSetPerPage}
        goToPage={setCurrentPage}
        goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        sortKey={sortKey ?? undefined}
        sortDirection={sortDirection}
        onSort={(key) => handleSort(key as PaymentSortKey)}
        rowActions={(_payment, close) => (
          <>
            <button
              className={styles.rowMenuItem}
              onClick={(e) => { e.stopPropagation(); close(); }}
            >
              View Details
            </button>
            <button
              className={styles.rowMenuItem}
              onClick={(e) => { e.stopPropagation(); close(); }}
            >
              Refund
            </button>
          </>
        )}
      />
    </div>
  );
}
