"use client";

import styles from "./OverlayBookingDetails.module.css";
import {
  UnderlineDateInput,
  UnderlineTextInput,
  UnderlineDropdownInput,
} from "../../UnderlineInput";
import { useState } from "react";
import Booking from "@/domain/entities/Booking";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdCancel, MdPending } from "react-icons/md";
import { FaClock } from "react-icons/fa6";

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

interface OverlayBookingDetailsProps {
  booking: Booking;
  onClose: () => void;
}

export default function OverlayBookingDetails({
  booking,
  onClose,
}: OverlayBookingDetailsProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    booking.startDate ? new Date(booking.startDate) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    booking.endDate ? new Date(booking.endDate) : null,
  );
  const [name, setName] = useState(booking.name);
  const [carMake, setCarMake] = useState(booking.carMake);
  const [carModel, setCarModel] = useState(booking.carModel);
  const [carYear, setCarYear] = useState(booking.carYear);
  const [serviceName, setServiceName] = useState(booking.serviceName);
  const [status, setStatus] = useState(booking.status);

  return (
    <section className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.bookingContainerWrapper}>
        <div className={styles.bookingContainer}>
          <div className={styles.sectionDetails}>
            <h1 className={styles.title}>Service Details</h1>
            {/* ID */}
            <div className={styles.details}>
              <h2>Service ID</h2>
              <div className={styles.owner}>
                <span>#{booking.id}</span>
              </div>
            </div>
            {/* Owner */}
            <div className={styles.details}>
              <h2>Owner</h2>
              <div className={styles.owner}>
                <img src={booking.ownerIcon} alt={booking.name} />
                <span>{booking.name}</span>
              </div>
            </div>

            {/* Make */}
            <div className={styles.details}>
              <h2>Car Make</h2>
              <div className={styles.owner}>
                <span>{booking.carMake}</span>
              </div>
            </div>
            {/* Model */}
            <div className={styles.details}>
              <h2>Car Model</h2>
              <div className={styles.owner}>
                <span>{booking.carModel}</span>
              </div>
            </div>
            {/* Year */}
            <div className={styles.details}>
              <h2>Car Year</h2>
              <div className={styles.owner}>
                <span>{booking.carYear}</span>
              </div>
            </div>
            {/* Status */}
            <div className={styles.details}>
              <h2>Status</h2>
              <div className={styles.owner}>
                {getStatusIcon(booking.status)}
                <span>{booking.status}</span>
              </div>
            </div>

            {/* Dates */}
            <div className={styles.row}>
              <UnderlineDateInput
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                span={6}
              />
              <UnderlineDateInput
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                span={6}
                dropdownAlign="right"
              />
            </div>
          </div>
          {/* Service Details */}
          <div className={styles.sectionDetails}></div>
        </div>
      </div>
    </section>
  );
}
