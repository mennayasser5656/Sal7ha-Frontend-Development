import React from "react";
import styles from "./OverlayBookingDetails.module.css";
import { GrHistory } from "react-icons/gr";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { IoCash } from "react-icons/io5";
import { GoShieldCheck } from "react-icons/go";

interface Booking {
  id: string;
  serviceName: string;
  serviceIcon: string;
  carType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface OverlayBookingDetailsProps {
  booking: Booking;
  onClose: () => void;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "In-Progress":
      return styles.inProgress;
    case "Completed":
      return styles.completed;
    case "Pending":
      return styles.pending;
    case "Cancelled":
      return styles.canceled;
    default:
      return "";
  }
};

export default function OverlayBookingDetails({
  booking,
  onClose,
}: OverlayBookingDetailsProps) {
  return (
    <section className={styles.overlay} onClick={onClose}>
      <div
        className={styles.bookingContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topBar}>
          <div className={styles.topBarContent}>
            <div className={styles.bill}>
              <span className={styles.billTitle}>Bill ID</span>
              <span className={styles.billID}>#{booking.id}</span>
            </div>
            <div className={styles.right}>
              <div className={styles.button}>
                <GrHistory />
                <span>History</span>
              </div>
              <div className={styles.button}>
                <HiDotsHorizontal />
              </div>
              <div className={styles.exit} onClick={onClose}>
                <IoClose />
              </div>
            </div>
          </div>
          <div className={styles.horizontalDivider} />
        </div>

        <div className={styles.bookingContent}>
          <div className={styles.bookingContentSection}>
            <span className={styles.title}>Main Details</span>
            <div className={styles.detail}>
              <h1>Car Type:</h1>
              <span>{booking.carType}</span>
            </div>
            <div className="flex gap-x-8">
              <div className={styles.detail}>
                <h1>Start Date:</h1>
                <span>{booking.startDate}</span>
              </div>
              <div className={styles.detail}>
                <h1>End Date:</h1>
                <span>{booking.endDate}</span>
              </div>
            </div>
            <div className={styles.detail}>
              <h1>Status:</h1>
              <div
                className={`${styles.status} ${getStatusClass(booking.status)}`}
              >
                {booking.status}
              </div>
            </div>
            <div className={styles.detail}>
              <h1>Payment Method:</h1>
              <div className="flex gap-1">
                <IoCash className={styles.cash} />
                <span>Cash</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className={styles.bookingContentSection}>
            <table className={styles.serviceTable}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className={styles.serviceName}>
                      <img src={booking.serviceIcon} alt="" />
                      <p>{booking.serviceName}</p>
                    </div>
                  </td>
                  <td>200 EGP</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full flex justify-center items-center">
              <div className={styles.viewDetails}>View Details</div>
            </div>
          </div>

          {/* Add Note Section */}
          <div className={styles.bookingContentSection}>
            <div className={styles.addNote}>
              <div className="flex">
                <h1>Add Note</h1>
                <span>(Optional)</span>
              </div>
              <textarea
                id="message"
                name="message"
                rows={2}
                placeholder="Add a note here"
              ></textarea>
            </div>
          </div>

          {/* Price Section */}
          <div className={styles.bookingContentSection}>
            <div className={styles.subPrice}>
              <h1>Subtotal</h1>
              <p>200.00 EGP</p>
            </div>
            <div className={styles.subPrice}>
              <h1>Tax</h1>
              <p>0.00 EGP</p>
            </div>
            <div className={styles.total}>
              <h1>Total</h1>
              <p>200.00 EGP</p>
            </div>
          </div>

          <div className={styles.shield}>
            <GoShieldCheck />
            <span>All your transactions are secure & fast</span>
          </div>
        </div>
      </div>
    </section>
  );
}
