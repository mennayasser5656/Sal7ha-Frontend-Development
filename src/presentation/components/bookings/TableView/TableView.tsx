import React, { useState, useRef, useEffect } from "react";
import styles from "./TableView.module.css";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdCancel, MdPending } from "react-icons/md";
import OverlayBookingDetails from "../OverlayBookingDetails/OverlayBookingDetails";
import { IoIosCheckmarkCircle, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaClock } from "react-icons/fa6";

import Booking from "@/domain/entities/Booking";
import { SortKey, SortDirection } from "@/infrastructure/services/bookings.service";

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("done") || s.includes("accepted"))
    return <IoIosCheckmarkCircle className={styles.statusIconComplete} />;
  if (s.includes("pending"))
    return <MdPending className={styles.statusIconPending} />;
  if (s.includes("progress") || s.includes("ongoing"))
    return <FaClock className={styles.statusIconInProgress} />;
  if (s.includes("cancelled") || s.includes("cancel"))
    return <MdCancel className={styles.statusIconCancelled} />;
  return null;
};

interface TableViewProps {
  bookings: Booking[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  handleSort: (key: SortKey) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setPerPage: (value: number) => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  selectedBookings: Set<string>;
  setSelectedBookings: (selected: Set<string>) => void;
  onAcceptBooking: (id: string) => void;
  onDeclineBooking: (id: string) => void;
}

export default function TableView({
  bookings,
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
  selectedBookings,
  setSelectedBookings,
  onAcceptBooking,
  onDeclineBooking,
}: TableViewProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
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

  const handleSelectAll = () => {
    if (isChecked) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map((b) => b.id)));
    }
    setIsChecked(!isChecked);
  };

  const handleSelectBooking = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedBookings(newSelected);
    setIsChecked(newSelected.size === bookings.length);
  };

  const handleActionClick = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionMenu(openActionMenu === bookingId ? null : bookingId);
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

  const sortIcon = (key: SortKey) => (
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
      {openBooking && (
        <OverlayBookingDetails
          booking={openBooking}
          onClose={() => setOpenBooking(null)}
        />
      )}

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
              <th className={`${styles.sortableTh} ${sortKey === "serviceName" ? styles.sortedTh : ""}`} onClick={() => handleSort("serviceName")}>
                <div className={styles.thContent}>
                  {sortIcon("serviceName")}
                  Service Name
                </div>
              </th>
              <th className={`${styles.sortableTh} ${sortKey === "name" ? styles.sortedTh : ""}`} onClick={() => handleSort("name")}>
                <div className={styles.thContent}>
                  {sortIcon("name")}
                  Car Owner
                </div>
              </th>
              <th className={`${styles.sortableTh} ${sortKey === "carMake" ? styles.sortedTh : ""}`} onClick={() => handleSort("carMake")}>
                <div className={styles.thContent}>
                  {sortIcon("carMake")}
                  Brand
                </div>
              </th>
              <th className={`${styles.sortableTh} ${sortKey === "startDate" ? styles.sortedTh : ""}`} onClick={() => handleSort("startDate")}>
                <div className={styles.thContent}>
                  {sortIcon("startDate")}
                  Start Date
                </div>
              </th>
              <th className={`${styles.sortableTh} ${sortKey === "endDate" ? styles.sortedTh : ""}`} onClick={() => handleSort("endDate")}>
                <div className={styles.thContent}>
                  {sortIcon("endDate")}
                  End Date
                </div>
              </th>
              <th className={`${styles.sortableTh} ${sortKey === "status" ? styles.sortedTh : ""}`} onClick={() => handleSort("status")}>
                <div className={styles.thContent}>
                  {sortIcon("status")}
                  Status
                </div>
              </th>
              <th className={styles.actionColumn}></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
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
                      src={booking.ownerIcon}
                      alt={booking.name}
                      className={styles.ownerImage}
                    />
                    <span>{booking.name}</span>
                  </div>
                </td>
                <td>{booking.carMake} {booking.carModel} {booking.carYear}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>
                  <div className={styles.statusCell}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                  </div>
                </td>
                <td className={styles.actionColumn}>
                  <div className={styles.actionWrapper} ref={openActionMenu === booking.id ? actionMenuRef : undefined}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => handleActionClick(booking.id, e)}
                      aria-label="Row actions"
                    >
                      ⋯
                    </button>
                    {openActionMenu === booking.id && (
                      <div className={styles.actionMenu}>
                        <button
                          className={styles.actionMenuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptBooking(booking.id);
                            setOpenActionMenu(null);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className={styles.actionMenuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeclineBooking(booking.id);
                            setOpenActionMenu(null);
                          }}
                        >
                          Decline
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
            min="0"
            max={totalPages}
          />
        </div>
      </div>
    </>
  );
}
