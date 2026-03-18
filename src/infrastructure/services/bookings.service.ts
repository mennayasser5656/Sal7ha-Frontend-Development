import Booking from "@/domain/entities/Booking";

export function filterBookings(bookings: Booking[], filter: string): Booking[] {
  switch (filter) {
    case "Alphabetically":
      return [...bookings].sort((a, b) =>
        a.serviceName.localeCompare(b.serviceName),
      );
    case "Status":
      return [...bookings].sort((a, b) => a.status.localeCompare(b.status));
    default:
      return bookings;
  }
}

export function sortBookings(bookings: Booking[], sort: string): Booking[] {
  switch (sort) {
    case "Ascending":
      return [...bookings].sort((a, b) =>
        a.serviceName.localeCompare(b.serviceName),
      );
    case "Descending":
      return [...bookings].sort((a, b) =>
        b.serviceName.localeCompare(a.serviceName),
      );
    case "Time: Early":
      return [...bookings].sort(
        (a, b) =>
          Number(a.startDate.split(" ")[1]) -
          Number(b.startDate.split(" ")[1]),
      );
    case "Time: Late":
      return [...bookings].sort(
        (a, b) =>
          Number(b.startDate.split(" ")[1]) -
          Number(a.startDate.split(" ")[1]),
      );
    default:
      return bookings;
  }
}

export function searchBookings(bookings: Booking[], query: string): Booking[] {
  if (!query) return bookings;
  const q = query.toLowerCase();
  return bookings.filter(
    (b) =>
      b.serviceName.toLowerCase().includes(q) ||
      b.carType.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q),
  );
}

export function generateMockBookings(): Booking[] {
  const services = [
    {
      name: "Engine Diagnostics & Checkup",
      icon: "/assets/engine_service.svg",
    },
    { name: "Tire Rotation & Alignment", icon: "/assets/wheel_service.svg" },
    { name: "Paint Job", icon: "/assets/paint_service.svg" },
    {
      name: "Battery Check & Replacement",
      icon: "/assets/battery_service.svg",
    },
  ];

  const carTypes = [
    "Nissan",
    "Toyota",
    "Honda",
    "BMW",
    "Mercedes",
    "Audi",
    "Ford",
  ];
  const names = ["Marwan", "Hassan", "Menna", "Ferial", "Eslam", "Mohamed"];
  const statuses = ["In-Progress", "Completed", "Pending", "Cancelled"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const bookings: Booking[] = [];

  for (let i = 1; i <= 25; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDay = days[Math.floor(Math.random() * days.length)];
    const endDay = days[Math.floor(Math.random() * days.length)];
    const startDayNum = Math.floor(Math.random() * 28) + 1;
    const endDayNum = startDayNum + Math.floor(Math.random() * 3) + 1;

    bookings.push({
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      serviceName: service.name,
      name: name,
      serviceIcon: service.icon,
      carType,
      startDate: `${startDay} ${startDayNum}`,
      endDate: `${endDay} ${endDayNum}`,
      status,
    });
  }

  return bookings;
}
