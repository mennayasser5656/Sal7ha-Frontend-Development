"use client";

import { useState } from "react";
import styles from "./bookings.module.css";
import { RiSearch2Line } from "react-icons/ri";
import TableView from "@/presentation/components/bookings/TableView/TableView";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import ActionDropdown from "@/presentation/components/ActionDropdown/ActionDropdown";
import DateActionButton from "@/presentation/components/DateActionButton/DateActionButton";
import ToastContainer from "@/presentation/components/Toast/Toast";
import { useBookings } from "@/application/hooks/useBookings";

const STATUS_FILTERS = ["In-Progress", "Completed", "Pending", "Cancelled", "Accepted"];

export default function BookingsView() {
  const {
    bookings,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    dateRangeStart,
    dateRangeEnd,
    setDateRangeStart,
    setDateRangeEnd,
    acceptBookings,
    declineBookings,
    notifications,
    dismissNotification,
    ...tableProps
  } = useBookings();

  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

  const dateRange = dateRangeStart ? { start: dateRangeStart, end: dateRangeEnd } : null;

  const handleRangeChange = (range: { start: Date; end: Date | null } | null) => {
    setDateRangeStart(range?.start ?? null);
    setDateRangeEnd(range?.end ?? null);
  };

  const handleAccept = () => {
    acceptBookings(selectedBookings);
    setSelectedBookings(new Set());
  };

  const handleDecline = () => {
    declineBookings(selectedBookings);
    setSelectedBookings(new Set());
  };

  return (
    <div className={styles.section}>
      <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
      <h1 className={styles.title}>Bookings</h1>
      <div className={styles.tools}>
        <div className={styles.toolsLeft}>
          <Dropdown
            options={STATUS_FILTERS}
            selected={selectedStatus}
            onSelect={setSelectedStatus}
            label="Status"
          />
          <DateActionButton
            range={dateRange}
            onRangeChange={handleRangeChange}
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
          <ActionDropdown
            count={selectedBookings.size}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </div>
      </div>
      <TableView
        bookings={bookings}
        {...tableProps}
        selectedBookings={selectedBookings}
        setSelectedBookings={setSelectedBookings}
        onAcceptBooking={(id) => acceptBookings(new Set([id]))}
        onDeclineBooking={(id) => declineBookings(new Set([id]))}
      />
    </div>
  );
}
