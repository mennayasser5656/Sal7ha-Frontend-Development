"use client";

import styles from "./OverlayBookingDetails.module.css";
import {
  UnderlineDateInput,
  UnderlineTextInput,
  UnderlineDropdownInput,
} from "../../UnderlineInput";
import { useState } from "react";
import Booking from "@/domain/entities/Booking";
import StatusIcon from "@/presentation/components/common/StatusIcon/StatusIcon";
import {
  DEFAULT_OWNER_ICON,
  resolveBookingCarIcon,
  resolveBookingServiceIcon,
} from "../bookingVisuals";

interface OverlayBookingDetailsProps {
  booking: Booking;
  onClose: () => void;
}

export default function OverlayBookingDetails({
  booking,
  onClose,
}: OverlayBookingDetailsProps) {
  const CarIcon = resolveBookingCarIcon(booking.carMake);
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
  const [price, setPrice] = useState(String(booking.price));

  return (
    <section className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.bookingContainerWrapper}>
        <div className={styles.bookingContainer}>
          <h1 className={styles.title}>Service Details</h1>
          <div className={styles.sectionDetails}>
            <h2>Main Details</h2>
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
                <img src={booking.ownerIcon || DEFAULT_OWNER_ICON} alt={booking.name} />
                <span>{booking.name}</span>
              </div>
            </div>

            {/* Make */}
            <div className={styles.details}>
              <h2>Car Make</h2>
              <div className={styles.owner}>
                <span className={styles.carLogoIcon} aria-hidden="true">
                  <CarIcon />
                </span>
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
                <StatusIcon status={booking.status} />
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
          <div className={styles.sectionDetails}>
            <h2>Services</h2>
            <div className={styles.service}>
              <div className={styles.owner}>
                <img src={resolveBookingServiceIcon(booking)} alt={booking.serviceName} />
                <span>{booking.serviceName}</span>
              </div>
              <div className={styles.serviceDetails}>
                {booking.serviceDetails.map((detail) => (
                  <span key={detail.label}>
                    {detail.label}: {detail.value}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.paymentDetails}>
              <h1>Payment details</h1>
              <div className={styles.price}>
                <h2>Price (ex. VAT)</h2>
                <input
                  className={styles.priceInput}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={`$${booking.price}`}
                />
              </div>
            </div>
          </div>
          <div className={`${styles.row} ${styles.actionsRow}`}>
            <button className={`${styles.actionBtn} ${styles.decline}`}>
              Decline
            </button>
            <button className={`${styles.actionBtn} ${styles.accept}`}>
              Accept
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
