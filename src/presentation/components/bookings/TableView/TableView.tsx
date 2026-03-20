import React, { useState } from "react";
import styles from "./TableView.module.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdCheckCircle, MdAccessTime, MdCancel } from "react-icons/md";
import SelectionToolBar from "../SelectionToolBar/SelectionToolBar";
import OverlayBookingDetails from "../OverlayBookingDetails/OverlayBookingDetails";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdPending } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import Booking from "@/domain/entities/Booking";

const getOwnerImage = (index: number): string => {
  const images = [
    "/assets/man1.avif",
    "/assets/man2.avif",
    "/assets/woman1.jpg",
    "/assets/woman2.avif",
  ];
  return images[index % images.length];
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();

  if (statusLower.includes("completed") || statusLower.includes("done")) {
    return <IoIosCheckmarkCircle className={styles.statusIconComplete} />;
  } else if (statusLower.includes("pending")) {
    return <MdPending className={styles.statusIconPending} />;
  } else if (
    statusLower.includes("progress") ||
    statusLower.includes("ongoing")
  ) {
    return <FaClock className={styles.statusIconInProgress} />;
  } else if (
    statusLower.includes("cancelled") ||
    statusLower.includes("cancel")
  ) {
    return <MdCancel className={styles.statusIconCancelled} />;
  }
  return null;
};

interface TableViewProps {
  bookings: Booking[];
}

export default function TableView({ bookings }: TableViewProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);

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

  const handleActionClick = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Action menu for booking:", bookingId);
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

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
              <th>
                <div className={styles.idColumn}>
                  <input
                    className={styles.checkBox}
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleSelectAll}
                  />
                </div>
              </th>
              <th>Service Name</th>
              <th>Car Owner</th>
              <th>Brand</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th className={styles.actionColumn}></th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking, index) => (
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
                <td>
                  <div className={styles.ownerInfo}>
                    <img
                      src={getOwnerImage(index)}
                      alt={booking.name}
                      className={styles.ownerImage}
                    />
                    <span>{booking.name}</span>
                  </div>
                </td>
                <td>{booking.carType}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>
                  <div className={styles.statusCell}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                  </div>
                </td>
                <td className={styles.actionColumn}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => handleActionClick(booking.id, e)}
                    aria-label="Row actions"
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        </div>
        <div className={styles.chooseNumber}>
          <span>Go to page</span>
          <input
            type="text"
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
