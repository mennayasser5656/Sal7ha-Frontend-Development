import { useState, useMemo, useCallback, useEffect } from "react";
import Booking from "@/domain/entities/Booking";
import { getAccountSetupWarnings } from "@/application/utils/accountSetupWarnings";
import { getAccountProfile } from "@/infrastructure/services/account.service";
import {
  getCalendarDays,
  getMonthName,
  getDayLabels,
  formatBookingDateRange,
  getClientImage,
  getDefaultWidgetIds,
  getWidgetById,
  ALL_WIDGETS,
  getDashboardSummary,
  getDashboardMonthBookings,
  getDashboardWidgets,
  updateDashboardWidgets,
  getBusinessSetupWarnings,
  getBusinessProfile,
  SETUP_WARNINGS,
  type BusinessProfileResponse,
  type SetupWarning,
  type StatusCounts,
  type WidgetDefinition,
} from "@/infrastructure/services/dashboard.service";

function mergeSetupWarnings(
  warnings: SetupWarning[],
  accountWarnings: SetupWarning[],
) {
  const warningsById = new Map(
    SETUP_WARNINGS.filter((warning) => warning.segment !== "personal").map(
      (warning) => [warning.id, warning],
    ),
  );

  warnings.forEach((warning) => warningsById.set(warning.id, warning));
  accountWarnings.forEach((warning) =>
    warningsById.set(warning.id, warning),
  );
  return Array.from(warningsById.values());
}

export function useDashboard() {
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    inProgress: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    accepted: 0,
    total: 0,
  });
  const [activeWidgets, setActiveWidgets] = useState<WidgetDefinition[]>(() =>
    getDefaultWidgetIds()
      .map(getWidgetById)
      .filter((widget): widget is WidgetDefinition => Boolean(widget)),
  );
  const [inactiveWidgets, setInactiveWidgets] = useState<WidgetDefinition[]>(
    () => ALL_WIDGETS.filter((w) => !getDefaultWidgetIds().includes(w.id)),
  );
  const [setupWarnings, setSetupWarnings] = useState<SetupWarning[]>([]);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfileResponse | null>(null);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const monthName = getMonthName(viewMonth);
  const dayLabels = getDayLabels();

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  useEffect(() => {
    let ignore = false;

    async function loadDashboardStaticData() {
      const [summary, widgets, warnings, profile, accountProfile] = await Promise.all([
        getDashboardSummary(),
        getDashboardWidgets(),
        getBusinessSetupWarnings(),
        getBusinessProfile(),
        getAccountProfile(),
      ]);

      if (ignore) return;

      setStatusCounts({
        inProgress: summary.inProgress,
        completed: summary.completed,
        pending: summary.pending,
        cancelled: summary.cancelled,
        accepted: summary.accepted,
        total: summary.totalBookings,
      });
      setActiveWidgets(widgets.activeWidgets);
      setInactiveWidgets(widgets.inactiveWidgets);
      setSetupWarnings(
        mergeSetupWarnings(warnings, getAccountSetupWarnings(accountProfile)),
      );
      setBusinessProfile(profile);
    }

    void loadDashboardStaticData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMonthBookings() {
      const response = await getDashboardMonthBookings(viewYear, viewMonth);
      if (!ignore) {
        setMonthBookings(response.bookings);
      }
    }

    void loadMonthBookings();

    return () => {
      ignore = true;
    };
  }, [viewMonth, viewYear]);

  const addWidget = useCallback((id: string) => {
    const nextIds = [...activeWidgets.map((widget) => widget.id), id];
    setActiveWidgets((prev) => [
      ...prev,
      inactiveWidgets.find((widget) => widget.id === id),
    ].filter((widget): widget is WidgetDefinition => Boolean(widget)));
    setInactiveWidgets((prev) => prev.filter((widget) => widget.id !== id));
    void updateDashboardWidgets(nextIds).then((response) => {
      setActiveWidgets(response.activeWidgets);
      setInactiveWidgets(response.inactiveWidgets);
    });
  }, [activeWidgets, inactiveWidgets]);

  const removeWidget = useCallback((id: string) => {
    const nextIds = activeWidgets
      .map((widget) => widget.id)
      .filter((widgetId) => widgetId !== id);
    setActiveWidgets((prev) => prev.filter((widget) => widget.id !== id));
    const removed = activeWidgets.find((widget) => widget.id === id);
    if (removed) {
      setInactiveWidgets((prev) => [...prev, removed]);
    }
    void updateDashboardWidgets(nextIds).then((response) => {
      setActiveWidgets(response.activeWidgets);
      setInactiveWidgets(response.inactiveWidgets);
    });
  }, [activeWidgets]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return {
    today,
    viewMonth,
    viewYear,
    monthName,
    dayLabels,
    calendarDays,
    monthBookings,
    prevMonth,
    nextMonth,
    formatBookingDateRange,
    getClientImage,
    statusCounts,
    activeWidgets,
    inactiveWidgets,
    setupWarnings,
    businessProfile,
    addWidget,
    removeWidget,
  };
}
