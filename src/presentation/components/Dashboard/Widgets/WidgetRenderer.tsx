"use client";

import { WidgetDefinition } from "@/infrastructure/services/dashboard.service";
import { StatusCounts } from "@/infrastructure/services/dashboard.service";
import Booking from "@/domain/entities/Booking";
import ProfileWidget from "./ProfileWidget/ProfileWidget";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import StatusWidget from "./StatusWidget/StatusWidget";

interface WidgetRendererProps {
  widget: WidgetDefinition;
  statusCounts: StatusCounts;
  calendarProps: {
    today: Date;
    viewMonth: number;
    viewYear: number;
    monthName: string;
    dayLabels: string[];
    calendarDays: { day: number; outside: boolean }[];
    monthBookings: Booking[];
    prevMonth: () => void;
    nextMonth: () => void;
    formatBookingDateRange: (start: string, end: string) => string;
    getClientImage: (index: number) => string;
  };
}

export default function WidgetRenderer({ widget, statusCounts, calendarProps }: WidgetRendererProps) {
  switch (widget.type) {
    case "profile":
      return <ProfileWidget key={widget.id} />;
    case "calendar":
      return <CalendarWidget key={widget.id} {...calendarProps} />;
    case "status":
      return (
        <StatusWidget
          key={widget.id}
          title={widget.title}
          count={statusCounts[widget.statusKey!]}
          total={statusCounts.total}
          color={widget.color!}
        />
      );
    default:
      return null;
  }
}
