"use client";

import styles from "./bookings.module.css";
import { RiSearch2Line } from "react-icons/ri";
import TableView from "@/presentation/components/bookings/TableView/TableView";
import ActionButton from "@/presentation/components/ActionButton/ActionButton";
import { useBookings } from "@/application/hooks/useBookings";

const STATUS_FILTERS = ["In-Progress", "Completed", "Pending", "Cancelled"];

export default function BookingsView() {
  const {
    bookings: processedBookings,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
  } = useBookings();

  return (
    <div className={styles.section}>
      <h1 className={styles.title}>Bookings</h1>
      <div className={styles.tools}>
        <div className={styles.toolsLeft}>
          <div className={styles.statusButtons}>
            {STATUS_FILTERS.map((status) => (
              <ActionButton
                key={status}
                label={status}
                isActive={selectedStatus === status}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
              />
            ))}
          </div>
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
          <div className={styles.separator} />
        </div>
      </div>
      <TableView bookings={processedBookings} />
    </div>
  );
}
