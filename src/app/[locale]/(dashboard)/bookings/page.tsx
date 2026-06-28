"use client";

import { useState, type MouseEvent } from "react";
import styles from "./bookings.module.css";
import { RiSearch2Line } from "react-icons/ri";
import TableView, { ColumnDef } from "@/presentation/components/TableView/TableView";
import OverlayBookingDetails from "@/presentation/components/bookings/OverlayBookingDetails/OverlayBookingDetails";
import StatusIcon from "@/presentation/components/common/StatusIcon/StatusIcon";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import ActionDropdown from "@/presentation/components/ActionDropdown/ActionDropdown";
import DateActionButton from "@/presentation/components/DateActionButton/DateActionButton";
import ToastContainer from "@/presentation/components/Toast/Toast";
import {
  DEFAULT_OWNER_ICON,
  resolveBookingCarIcon,
  resolveBookingServiceIcon,
} from "@/presentation/components/bookings/bookingVisuals";
import { useBookings } from "@/application/hooks/useBookings";
import Booking from "@/domain/entities/Booking";
import { SortKey } from "@/infrastructure/services/bookings.service";
import { normalizeStatus } from "@/infrastructure/services/status.service";

const STATUS_FILTERS = ["In-Progress", "Completed", "Pending", "Cancelled", "Accepted"];

const COLUMNS: ColumnDef<Booking>[] = [
  {
    key: "serviceName",
    label: "Service Name",
    sortable: true,
    render: (b) => (
      <div className={styles.serviceName}>
        <img src={resolveBookingServiceIcon(b)} alt="" />
        <p>{b.serviceName}</p>
      </div>
    ),
  },
  {
    key: "name",
    label: "Car Owner",
    sortable: true,
    render: (b) => (
      <div className={styles.ownerInfo}>
        <img src={b.ownerIcon || DEFAULT_OWNER_ICON} alt={b.name} className={styles.ownerImage} />
        <span>{b.name}</span>
      </div>
    ),
  },
  {
    key: "carMake",
    label: "Brand",
    sortable: true,
    render: (b) => {
      const CarIcon = resolveBookingCarIcon(b.carMake);

      return (
        <div className={styles.carInfo}>
          <span className={styles.carLogoIcon} aria-hidden="true">
            <CarIcon />
          </span>
          <span>{`${b.carMake} ${b.carModel} ${b.carYear}`}</span>
        </div>
      );
    },
  },
  { key: "startDate", label: "Start Date", sortable: true, render: (b) => b.startDate },
  { key: "endDate", label: "End Date", sortable: true, render: (b) => b.endDate },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (b) => (
      <div className={styles.statusCell}>
        <StatusIcon status={b.status} />
        <span>{b.status}</span>
      </div>
    ),
  },
];

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
    completeBookings,
    declineBookings,
    cancelBookings,
    notifications,
    dismissNotification,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    itemsPerPage,
    setPerPage,
    goToPage,
    goToPreviousPage,
    goToNextPage,
  } = useBookings();

  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);

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

  const handleOverlayStatusChange = (id: string, status: string) => {
    const ids = new Set([id]);
    switch (status) {
      case "In-Progress":
        acceptBookings(ids);
        break;
      case "Completed":
        completeBookings(ids);
        break;
      case "Cancelled":
        cancelBookings(ids);
        break;
    }
    setOpenBooking(null);
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
          <DateActionButton range={dateRange} onRangeChange={handleRangeChange} />
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

      {openBooking && (
        <OverlayBookingDetails
          booking={openBooking}
          onClose={() => setOpenBooking(null)}
          onStatusChange={(status) => handleOverlayStatusChange(openBooking.id, status)}
        />
      )}

      <TableView
        columns={COLUMNS}
        data={bookings}
        getRowId={(b) => b.id}
        selectedRows={selectedBookings}
        setSelectedRows={setSelectedBookings}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setPerPage={setPerPage}
        goToPage={goToPage}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        sortKey={sortKey ?? undefined}
        sortDirection={sortDirection}
        onSort={(key) => handleSort(key as SortKey)}
        onRowClick={setOpenBooking}
        rowActions={(booking, close) => {
          const statusKey = normalizeStatus(booking.status);
          const ids = new Set([booking.id]);
          const runAction = (action: (set: Set<string>) => void) => (
            e: MouseEvent,
          ) => {
            e.stopPropagation();
            action(ids);
            close();
          };

          if (statusKey === "pending") {
            return (
              <>
                <button className={styles.rowMenuItem} onClick={runAction(acceptBookings)}>
                  Accept
                </button>
                <button className={styles.rowMenuItem} onClick={runAction(declineBookings)}>
                  Decline
                </button>
              </>
            );
          }

          if (statusKey === "inProgress") {
            return (
              <>
                <button className={styles.rowMenuItem} onClick={runAction(completeBookings)}>
                  Mark Completed
                </button>
                <button className={styles.rowMenuItem} onClick={runAction(cancelBookings)}>
                  Cancel
                </button>
              </>
            );
          }

          return (
            <span className={styles.rowMenuEmpty}>No actions available</span>
          );
        }}
      />
    </div>
  );
}
