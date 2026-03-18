import React, { useState } from "react";
import styles from "./TableView.module.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import SelectionToolBar from "../SelectionToolBar/SelectionToolBar";
import {
  InProgressComponent,
  PendingComponent,
  CanceledComponent,
  CompletedComponent,
} from "@/presentation/components/common/StatusComponent/StatusComponent";
import OverlayBookingDetails from "../OverlayBookingDetails/OverlayBookingDetails";
import Booking from "@/domain/entities/Booking";
import ColumnSelectionBar, { ColumnOption } from "../ColumnSelectionBar/ColumnSelectionBar";

const renderStatusComponent = (status: string) => {
  switch (status) {
    case "In-Progress":
      return <InProgressComponent />;
    case "Pending":
      return <PendingComponent />;
    case "Cancelled":
      return <CanceledComponent />;
    case "Completed":
      return <CompletedComponent />;
    default:
      return <span>{status}</span>;
  }
};

const OPTIONAL_COLUMNS: Omit<ColumnOption, "visible">[] = [
  { key: "carOwner", label: "Car Owner" },
  { key: "carType",  label: "Car Type"  },
  { key: "startDate", label: "Start Date" },
  { key: "endDate",   label: "End Date"  },
];

interface TableViewProps {
  bookings: Booking[];
}

export default function TableView({ bookings }: TableViewProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
  const [showColumnBar, setShowColumnBar] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(OPTIONAL_COLUMNS.map((c) => c.key))
  );

  const columns: ColumnOption[] = OPTIONAL_COLUMNS.map((c) => ({
    ...c,
    visible: visibleColumns.has(c.key),
  }));

  const handleToggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = () => {
    if (isChecked) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(currentBookings.map((b) => b.id)));
    }
    setIsChecked(!isChecked);
  };

  const handleSelectBooking = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBookings(newSelected);
    setIsChecked(newSelected.size === currentBookings.length);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setItemsPerPage(value);
      setCurrentPage(1);
    }
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(goToPageInput);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setGoToPageInput("");
      }
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
      {openBooking && (
        <OverlayBookingDetails
          booking={openBooking}
          onClose={() => setOpenBooking(null)}
        />
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.idColumn}>
                <input
                  className={styles.checkBox}
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleSelectAll}
                />
                ID
              </th>
              <th>Service Name</th>
              {visibleColumns.has("carOwner") && <th>Car Owner</th>}
              {visibleColumns.has("carType")  && <th>Car Type</th>}
              {visibleColumns.has("startDate") && <th>Start Date</th>}
              {visibleColumns.has("endDate")   && <th>End Date</th>}
              <th>Status</th>
              <th
                className={`${styles.addColumn} ${showColumnBar ? styles.addColumnActive : ""}`}
                onClick={() => setShowColumnBar((v) => !v)}
              >
                +
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking) => (
              <tr
                key={booking.id}
                className={`${styles.clickableRow} ${selectedBookings.has(booking.id) ? styles.isSelected : ""}`}
                onClick={() => setOpenBooking(booking)}
              >
                <td>
                  <div className={styles.idColumn}>
                    <input
                      className={styles.checkBox}
                      type="checkbox"
                      checked={selectedBookings.has(booking.id)}
                      onChange={() => {}}
                      onClick={(e) => handleSelectBooking(booking.id, e)}
                    />
                    {booking.id}
                  </div>
                </td>
                <td>
                  <div className={styles.services}>
                    <div className={styles.serviceName}>
                      <img src={booking.serviceIcon} alt="" />
                      <p>{booking.serviceName}</p>
                    </div>
                  </div>
                </td>
                {visibleColumns.has("carOwner")  && <td>{booking.name}</td>}
                {visibleColumns.has("carType")   && <td>{booking.carType}</td>}
                {visibleColumns.has("startDate") && <td>{booking.startDate}</td>}
                {visibleColumns.has("endDate")   && <td>{booking.endDate}</td>}
                <td>{renderStatusComponent(booking.status)}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showColumnBar && (
        <ColumnSelectionBar
          columns={columns}
          onToggle={handleToggleColumn}
          onClose={() => setShowColumnBar(false)}
        />
      )}

      <SelectionToolBar
        selectedCount={selectedBookings.size}
        onClearSelection={() => {
          setSelectedBookings(new Set());
          setIsChecked(false);
        }}
        onDelete={() => console.log("Delete", [...selectedBookings])}
        onChangeStatus={(status) =>
          console.log("Change to", status, [...selectedBookings])
        }
      />

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.chooseNumber}>
          <span>Showing per page</span>
          <input
            type="number"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            min="1"
          />
        </div>
        <div className={styles.pageNumbers}>
          <div className={styles.icon} onClick={goToFirstPage}>
            <MdKeyboardDoubleArrowLeft />
          </div>
          <div className={styles.icon} onClick={goToPreviousPage}>
            <MdKeyboardArrowLeft />
          </div>
          {getPageNumbers().map((page, index) => (
            <div
              key={index}
              className={`${styles.pageNumber} ${page === currentPage ? styles.activePage : ""} ${page === "..." ? styles.dots : ""}`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
            >
              {page}
            </div>
          ))}
          <div className={styles.icon} onClick={goToNextPage}>
            <MdKeyboardArrowRight />
          </div>
          <div className={styles.icon} onClick={goToLastPage}>
            <MdKeyboardDoubleArrowRight />
          </div>
        </div>
        <div className={styles.chooseNumber}>
          <span>Go To Page</span>
          <input
            type="number"
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyDown={handleGoToPage}
            placeholder={`1-${totalPages}`}
            min="0"
            max={totalPages}
          />
        </div>
      </div>
    </>
  );
}
