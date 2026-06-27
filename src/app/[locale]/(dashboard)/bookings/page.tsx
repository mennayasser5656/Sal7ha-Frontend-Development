"use client";

import { useState } from "react";
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
    declineBookings,
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
        <OverlayBookingDetails booking={openBooking} onClose={() => setOpenBooking(null)} />
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
        rowActions={(booking, close) => (
          <>
            <button
              className={styles.rowMenuItem}
              onClick={(e) => {
                e.stopPropagation();
                acceptBookings(new Set([booking.id]));
                close();
              }}
            >
              Accept
            </button>
            <button
              className={styles.rowMenuItem}
              onClick={(e) => {
                e.stopPropagation();
                declineBookings(new Set([booking.id]));
                close();
              }}
            >
              Decline
            </button>
          </>
        )}
      />
    </div>
  );
}
