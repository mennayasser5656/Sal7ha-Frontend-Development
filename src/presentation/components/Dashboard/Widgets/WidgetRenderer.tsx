"use client";

import {
  BusinessProfileResponse,
  SetupWarning,
  WidgetDefinition,
} from "@/infrastructure/services/dashboard.service";
import { StatusCounts } from "@/infrastructure/services/dashboard.service";
import Booking from "@/domain/entities/Booking";
import ProfileWidget from "./ProfileWidget/ProfileWidget";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import StatusWidget from "./StatusWidget/StatusWidget";
import StatusSummaryWidget from "./StatusSummaryWidget/StatusSummaryWidget";
import SetupWarningsWidget from "./SetupWarningsWidget/SetupWarningsWidget";

interface WidgetRendererProps {
  widget: WidgetDefinition;
  statusCounts: StatusCounts;
  setupWarnings: SetupWarning[];
  businessProfile: BusinessProfileResponse | null;
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

export default function WidgetRenderer({
  widget,
  statusCounts,
  setupWarnings,
  businessProfile,
  calendarProps,
}: WidgetRendererProps) {
  switch (widget.type) {
    case "profile":
      return (
        <ProfileWidget
          key={widget.id}
          name={businessProfile?.name ?? "Repair Shop"}
          imageUrl={businessProfile?.logoUrl ?? "/assets/profile_img.svg"}
          upToDate={setupWarnings.length === 0}
        />
      );
    case "calendar":
      return <CalendarWidget key={widget.id} {...calendarProps} />;
    case "setupWarnings":
      return (
        <SetupWarningsWidget
          key={widget.id}
          warnings={setupWarnings}
          statusCounts={statusCounts}
        />
      );
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
    case "statusSummary":
      return (
        <StatusSummaryWidget
          key={widget.id}
          title={widget.title}
          counts={statusCounts}
        />
      );
    default:
      return null;
  }
}
