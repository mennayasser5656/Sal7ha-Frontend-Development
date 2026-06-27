import React, { useState } from "react";
import styles from "./ListView.module.css";
import { IoIosArrowUp } from "react-icons/io";
import {
  CanceledStatus,
  CompletedStatus,
  InProgressStatus,
  PendingStatus,
} from "./StatusHeader/StatusHeader";
import {
  CanceledComponent,
  CompletedComponent,
  InProgressComponent,
  PendingComponent,
} from "@/presentation/components/common/StatusComponent/StatusComponent";
import Booking from "@/domain/entities/Booking";
import {
  resolveBookingCarIcon,
  resolveBookingServiceIcon,
} from "../bookingVisuals";

const STATUS_GROUPS = [
  { key: "Pending", label: "Pending" },
  { key: "In-Progress", label: "In Progress" },
  { key: "Completed", label: "Completed" },
];

const renderStatusHeader = (status: string, count: number) => {
  switch (status) {
    case "In-Progress":
      return <InProgressStatus size={count} />;
    case "Pending":
      return <PendingStatus size={count} />;
    case "Cancelled":
      return <CanceledStatus size={count} />;
    case "Completed":
      return <CompletedStatus size={count} />;
    default:
      return <span>{status}</span>;
  }
};

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

interface ListViewProps {
  bookings: Booking[];
}

export default function ListView({ bookings }: ListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(
    new Set(),
  );
  const [checkedGroups, setCheckedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const handleSelectAll = (groupKey: string, groupBookings: Booking[]) => {
    const allSelected = groupBookings.every((b) => selectedBookings.has(b.id));
    const newSelected = new Set(selectedBookings);
    if (allSelected) {
      groupBookings.forEach((b) => newSelected.delete(b.id));
      setCheckedGroups((prev) => ({ ...prev, [groupKey]: false }));
    } else {
      groupBookings.forEach((b) => newSelected.add(b.id));
      setCheckedGroups((prev) => ({ ...prev, [groupKey]: true }));
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectBooking = (
    id: string,
    groupKey: string,
    groupBookings: Booking[],
  ) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBookings(newSelected);
    setCheckedGroups((prev) => ({
      ...prev,
      [groupKey]: groupBookings.every((b) => newSelected.has(b.id)),
    }));
  };

  return (
    <div className={styles.listView}>
      {STATUS_GROUPS.map(({ key, label }) => {
        const groupBookings = bookings.filter((b) => b.status === key);
        if (groupBookings.length === 0) return null;
        const allSelected = groupBookings.every((b) =>
          selectedBookings.has(b.id),
        );

        return (
          <table key={key} className={styles.table}>
            <thead>
              <tr className={styles.statusRow}>
                <th
                  colSpan={7}
                  className={`${styles.statusHeader} ${styles[`status_${key.replace("-", "")}`]}`}
                >
                  <div className={styles.statusHeaderInner}>
                    {renderStatusHeader(key, groupBookings.length)}
                    <IoIosArrowUp
                      onClick={() => toggleGroup(key)}
                      className={`${styles.arrowIcon} ${collapsedGroups[key] ? styles.arrowDown : ""}`}
                    />
                  </div>
                </th>
              </tr>

              <tr className={styles.columnHeaderRow}>
                <th colSpan={7}>
                  <div
                    className={`${styles.collapsibleSection} ${collapsedGroups[key] ? styles.collapsed : ""}`}
                  >
                    <table style={{ width: "100%", tableLayout: "fixed" }}>
                      <tbody>
                        <tr>
                          <td className={styles.idColumn}>
                            <input
                              className={styles.checkBox}
                              type="checkbox"
                              checked={allSelected}
                              onChange={() =>
                                handleSelectAll(key, groupBookings)
                              }
                            />
                            ID
                          </td>
                          <td>Service Name</td>
                          <td>Car Type</td>
                          <td>Start Date</td>
                          <td>End Date</td>
                          <td>Status</td>
                          <td className={styles.addColumn}>+</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody
              className={`${styles.collapsibleSection} ${collapsedGroups[key] ? styles.collapsed : ""}`}
            >
              {groupBookings.map((booking) => {
                const CarIcon = resolveBookingCarIcon(booking.carMake);

                return (
                  <tr
                    key={booking.id}
                    className={
                      selectedBookings.has(booking.id) ? styles.isSelected : ""
                    }
                  >
                    <td>
                      <div className={styles.idColumn}>
                        <input
                          className={styles.checkBox}
                          type="checkbox"
                          checked={selectedBookings.has(booking.id)}
                          onChange={() =>
                            handleSelectBooking(booking.id, key, groupBookings)
                          }
                        />
                        {booking.id}
                      </div>
                    </td>
                    <td>
                      <div className={styles.serviceName}>
                        <img src={resolveBookingServiceIcon(booking)} alt="" />
                        <p>{booking.serviceName}</p>
                      </div>
                    </td>
                    <td>
                      <div className={styles.carInfo}>
                        <span className={styles.carLogoIcon} aria-hidden="true">
                          <CarIcon />
                        </span>
                        <span>
                          {booking.carMake} {booking.carModel}{" "}
                          {booking.carYear}
                        </span>
                      </div>
                    </td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td>{renderStatusComponent(booking.status)}</td>
                    <td></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}
