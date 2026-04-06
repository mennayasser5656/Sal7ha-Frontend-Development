"use client";

import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdCancel, MdPending } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { normalizeStatus, STATUS_ICON_COLORS } from "@/infrastructure/services/status.service";

const baseStyle = { flexShrink: 0 } as const;

export default function StatusIcon({ status }: { status: string }) {
  const key = normalizeStatus(status);
  const color = key ? STATUS_ICON_COLORS[key] : "#ccc";

  switch (key) {
    case "completed":
    case "accepted":
      return <IoIosCheckmarkCircle style={{ ...baseStyle, color, fontSize: "1.1rem" }} />;
    case "pending":
      return <MdPending style={{ ...baseStyle, color, fontSize: "1.1rem" }} />;
    case "inProgress":
      return <FaClock style={{ ...baseStyle, color, fontSize: "0.9rem" }} />;
    case "cancelled":
      return <MdCancel style={{ ...baseStyle, color, fontSize: "1.1rem" }} />;
    default:
      return null;
  }
}
