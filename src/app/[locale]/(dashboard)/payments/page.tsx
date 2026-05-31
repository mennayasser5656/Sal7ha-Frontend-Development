"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BsCreditCard2Front, BsPaypal } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { PiReceiptLight } from "react-icons/pi";
import { RiSearch2Line } from "react-icons/ri";
import { useClickOutside } from "@/application/hooks/useClickOutside";
import { usePayments } from "@/application/hooks/usePayments";
import type { Payment, PaymentSortKey } from "@/domain/entities/Payment";
import DateActionButton from "@/presentation/components/DateActionButton/DateActionButton";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import TableView, {
  ColumnDef,
} from "@/presentation/components/TableView/TableView";
import styles from "./payments.module.css";

function MethodCell({ method }: { method: Payment["method"] }) {
  if (method === "VISA") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconVisa}`}>
          <BsCreditCard2Front />
        </span>
        <span>VISA</span>
      </div>
    );
  }

  if (method === "Fawry") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconFawry}`}>
          <PiReceiptLight />
        </span>
        <span>Fawry</span>
      </div>
    );
  }

  if (method === "PayPal") {
    return (
      <div className={styles.methodCell}>
        <span className={`${styles.methodIcon} ${styles.methodIconPaypal}`}>
          <BsPaypal />
        </span>
        <span>PayPal</span>
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

const COLUMNS: ColumnDef<Payment>[] = [
  {
    key: "id",
    label: "PAYMENT ID",
    sortable: true,
    render: (payment) => (
      <span className={styles.paymentId}>{payment.id}</span>
    ),
  },
  {
    key: "customer",
    label: "CUSTOMER",
    sortable: true,
    render: (payment) => (
      <span className={styles.customerName}>{payment.customer}</span>
    ),
  },
  {
    key: "item",
    label: "ITEM / SERVICE",
    sortable: true,
    render: (payment) => (
      <span className={styles.serviceName}>{payment.item}</span>
    ),
  },
  {
    key: "method",
    label: "METHOD",
    sortable: true,
    render: (payment) => <MethodCell method={payment.method} />,
  },
  {
    key: "date",
    label: "DATE",
    sortable: true,
    render: (payment) => payment.date,
  },
  {
    key: "amount",
    label: "AMOUNT",
    sortable: true,
    render: (payment) => `$${payment.amount}`,
  },
];

function PaymentActionsDropdown({
  count,
  onRefund,
}: {
  count: number;
  onRefund: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  if (count === 0) {
    return null;
  }

  return (
    <div className={styles.actionsWrapper} ref={ref}>
      <button
        type="button"
        className={styles.actionsBtn}
        onClick={() => setOpen(!open)}
      >
        <span>Actions</span>
        <span className={styles.actionsBadge}>{count}</span>
        <IoIosArrowDown
          className={`${styles.actionsArrow} ${
            open ? styles.actionsArrowOpen : ""
          }`}
        />
      </button>
      {open && (
        <div className={styles.actionsMenu}>
          <button
            type="button"
            className={styles.actionsMenuItem}
            onClick={() => {
              onRefund();
              setOpen(false);
            }}
          >
            Refund
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const payments = usePayments();
  const params = useParams<{ locale: string }>();
  const exportHref = `/${params.locale}/payments/export`;
  const dateRange = payments.dateRangeStart
    ? { start: payments.dateRangeStart, end: payments.dateRangeEnd }
    : null;

  return (
    <div className={styles.section}>
      <h1 className={styles.title}>Payments</h1>

      <div className={styles.tools}>
        <div className={styles.toolsLeft}>
          <Dropdown
            options={payments.methodFilters}
            selected={payments.selectedMethod}
            onSelect={payments.setSelectedMethod}
            label="Method"
          />
          <DateActionButton
            range={dateRange}
            onRangeChange={payments.setDateRange}
          />
          <div className={styles.searchBar}>
            <RiSearch2Line />
            <input
              type="text"
              placeholder="Search"
              value={payments.searchQuery}
              onChange={(event) =>
                payments.setSearchQuery(event.target.value)
              }
            />
          </div>
          <span className={styles.verticalSeparator} aria-hidden="true" />
          <button
            type="button"
            className={`${styles.cardToggle} ${
              payments.showCards ? styles.cardToggleOn : ""
            }`}
            onClick={payments.toggleCards}
            aria-pressed={payments.showCards}
            aria-label={
              payments.showCards ? "Hide payment cards" : "Show payment cards"
            }
          >
            <span className={styles.cardToggleKnob} />
          </button>
        </div>

        <div className={styles.toolsRight}>
          <PaymentActionsDropdown
            count={payments.selectedPayments.size}
            onRefund={payments.clearSelectedPayments}
          />
          <Link href={exportHref} className={styles.exportBtn}>
            Export
          </Link>
        </div>
      </div>

      {payments.showCards && (
        <div className={styles.cards}>
          <div className={styles.card}>
            <span className={styles.cardLabel}>MONTHLY PAYMENTS</span>
            <span className={styles.cardAmount}>
              ${payments.summary.monthlyPayments}
            </span>
            <span className={styles.cardSub}>Payments that came in</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>YEARLY PAYMENTS</span>
            <span className={styles.cardAmount}>
              ${payments.summary.yearlyPayments}
            </span>
            <span className={styles.cardSub}>Projected from this history</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>ITEMS SOLD</span>
            <span className={styles.cardAmount}>
              {payments.summary.itemsSold}
            </span>
            <span className={styles.cardSub}>Paid item purchases</span>
          </div>
          <div className={`${styles.card} ${styles.cardDark}`}>
            <span className={styles.cardLabel}>SERVICES DONE</span>
            <span className={styles.cardAmount}>
              {payments.summary.servicesDone}
            </span>
            <span className={styles.cardSub}>Paid service jobs</span>
          </div>
        </div>
      )}

      <TableView
        columns={COLUMNS}
        data={payments.paginatedPayments}
        getRowId={(payment) => payment.id}
        selectedRows={payments.selectedPayments}
        setSelectedRows={payments.setSelectedPayments}
        currentPage={payments.currentPage}
        totalPages={payments.totalPages}
        itemsPerPage={payments.itemsPerPage}
        setPerPage={payments.handleSetPerPage}
        goToPage={payments.setCurrentPage}
        goToPreviousPage={() =>
          payments.setCurrentPage((page) => Math.max(1, page - 1))
        }
        goToNextPage={() =>
          payments.setCurrentPage((page) =>
            Math.min(payments.totalPages, page + 1),
          )
        }
        sortKey={payments.sortKey ?? undefined}
        sortDirection={payments.sortDirection}
        onSort={(key) => payments.handleSort(key as PaymentSortKey)}
        rowActions={(_payment, close) => (
          <>
            <button
              type="button"
              className={styles.rowMenuItem}
              onClick={(event) => {
                event.stopPropagation();
                close();
              }}
            >
              View Details
            </button>
            <button
              type="button"
              className={styles.rowMenuItem}
              onClick={(event) => {
                event.stopPropagation();
                close();
              }}
            >
              Refund
            </button>
          </>
        )}
      />
    </div>
  );
}
