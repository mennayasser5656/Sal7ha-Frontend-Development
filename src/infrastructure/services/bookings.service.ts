import Booking, { ServiceDetail } from "@/domain/entities/Booking";
import { parseDateMs, formatDate } from "./date.service";

export type SortKey = "serviceName" | "name" | "carMake" | "startDate" | "endDate" | "status" | null;
export type SortDirection = "asc" | "desc";

export function filterByStatus(bookings: Booking[], status: string | null): Booking[] {
  if (!status) return bookings;
  return bookings.filter((b) => b.status === status);
}

export function updateBookingStatuses(
  bookings: Booking[],
  ids: Set<string>,
  newStatus: string,
): Booking[] {
  return bookings.map((b) =>
    ids.has(b.id) ? { ...b, status: newStatus } : b,
  );
}

export function filterByDateRange(
  bookings: Booking[],
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Booking[] {
  if (!rangeStart) return bookings;
  const start = rangeStart.getTime();
  const end = rangeEnd ? rangeEnd.getTime() : start;
  return bookings.filter((b) => {
    const bStart = parseDateMs(b.startDate);
    const bEnd = parseDateMs(b.endDate);
    return bEnd >= start && bStart <= end;
  });
}

export function searchBookings(bookings: Booking[], query: string): Booking[] {
  if (!query) return bookings;
  const q = query.toLowerCase();
  return bookings.filter(
    (b) =>
      b.serviceName.toLowerCase().includes(q) ||
      b.carMake.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q),
  );
}

export function sortBookings(
  bookings: Booking[],
  sortKey: SortKey,
  sortDirection: SortDirection,
): Booking[] {
  if (!sortKey) return bookings;
  return [...bookings].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "serviceName") {
      comparison = a.serviceName.localeCompare(b.serviceName);
    } else if (sortKey === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortKey === "carMake") {
      comparison = a.carMake.localeCompare(b.carMake);
    } else if (sortKey === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortKey === "startDate") {
      comparison = parseDateMs(a.startDate) - parseDateMs(b.startDate);
    } else if (sortKey === "endDate") {
      comparison = parseDateMs(a.endDate) - parseDateMs(b.endDate);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export function paginateBookings(
  bookings: Booking[],
  currentPage: number,
  itemsPerPage: number,
): Booking[] {
  const start = (currentPage - 1) * itemsPerPage;
  return bookings.slice(start, start + itemsPerPage);
}

export function generateMockBookings(): Booking[] {
  const services: { name: string; icon: string; price: number; details: ServiceDetail[] }[] = [
    {
      name: "Engine Diagnostics & Checkup",
      icon: "/assets/engine_service.svg",
      price: 120,
      details: [
        { label: "Engine Code", value: "VQ35DE" },
        { label: "Fault Codes", value: "P0300, P0301" },
        { label: "Diagnostic Tool", value: "OBD-II Scanner" },
        { label: "Last Serviced", value: "12,000 km ago" },
        { label: "Recommended Action", value: "Replace spark plugs" },
      ],
    },
    {
      name: "Tire Rotation & Alignment",
      icon: "/assets/wheel_service.svg",
      price: 65,
      details: [
        { label: "Tire Brand", value: "Michelin" },
        { label: "Tire Size", value: "225/45R17" },
        { label: "Rotation Pattern", value: "X-Pattern" },
        { label: "Alignment Type", value: "4-Wheel" },
        { label: "Tread Depth", value: "5mm" },
      ],
    },
    {
      name: "Paint Job",
      icon: "/assets/paint_service.svg",
      price: 350,
      details: [
        { label: "Paint Type", value: "Metallic" },
        { label: "Color Code", value: "Pearl White" },
        { label: "Coat Layers", value: "3" },
        { label: "Surface Area", value: "Full Body" },
        { label: "Finish", value: "Glossy" },
      ],
    },
    {
      name: "Battery Check & Replacement",
      icon: "/assets/battery_service.svg",
      price: 85,
      details: [
        { label: "Battery Brand", value: "Bosch" },
        { label: "Voltage", value: "12V" },
        { label: "Capacity", value: "60Ah" },
        { label: "Cold Crank Amps", value: "540A" },
        { label: "Warranty", value: "2 years" },
      ],
    },
  ];

  const carMakes: { make: string; models: string[] }[] = [
    { make: "Nissan", models: ["Altima", "Sentra", "Maxima", "Patrol"] },
    { make: "Toyota", models: ["Camry", "Corolla", "Land Cruiser", "RAV4"] },
    { make: "Honda", models: ["Civic", "Accord", "CR-V", "Pilot"] },
    { make: "BMW", models: ["320i", "520i", "X3", "X5"] },
    { make: "Mercedes", models: ["C200", "E300", "GLC", "S500"] },
    { make: "Audi", models: ["A4", "A6", "Q5", "Q7"] },
    { make: "Ford", models: ["Fusion", "Mustang", "Explorer", "F-150"] },
  ];
  const carYears = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  const names = ["Marwan Mohamed", "Hassan Mohamed", "Menna Yasser", "Ferial Nashaat", "Eslam Mahmoud", "Mohamed Hany"];
  const ownerIcons = [
    "/assets/man1.avif",
    "/assets/man2.avif",
    "/assets/woman1.jpg",
    "/assets/woman2.avif",
  ];
  const statuses = ["In-Progress", "Completed", "Pending", "Cancelled"];

  const bookings: Booking[] = [];

  for (let i = 1; i <= 25; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const car = carMakes[Math.floor(Math.random() * carMakes.length)];
    const carModel = car.models[Math.floor(Math.random() * car.models.length)];
    const carYear = carYears[Math.floor(Math.random() * carYears.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const ownerIcon = ownerIcons[Math.floor(Math.random() * ownerIcons.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const startDate = new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 86400000);

    bookings.push({
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      serviceName: service.name,
      name: name,
      serviceIcon: service.icon,
      ownerIcon,
      carMake: car.make,
      carModel,
      carYear,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      status,
      price: service.price,
      serviceDetails: service.details,
    });
  }

  return bookings;
}
