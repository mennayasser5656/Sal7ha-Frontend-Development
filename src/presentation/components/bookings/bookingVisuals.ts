import Booking from "@/domain/entities/Booking";
import type { IconType } from "react-icons";
import { FaCarSide } from "react-icons/fa";
import {
  SiAlfaromeo,
  SiAstonmartin,
  SiAudi,
  SiBmw,
  SiChevrolet,
  SiCitroen,
  SiFerrari,
  SiFiat,
  SiFord,
  SiHonda,
  SiHyundai,
  SiJaguar,
  SiJeep,
  SiKia,
  SiLamborghini,
  SiLandrover,
  SiMazda,
  SiMercedes,
  SiMini,
  SiMitsubishi,
  SiNissan,
  SiOpel,
  SiPeugeot,
  SiPorsche,
  SiRenault,
  SiSeat,
  SiSkoda,
  SiSubaru,
  SiSuzuki,
  SiTesla,
  SiToyota,
  SiVolkswagen,
  SiVolvo,
} from "react-icons/si";

export const DEFAULT_OWNER_ICON = "/assets/profile_img.svg";

const SERVICE_ICON_ASSETS = {
  oil: "/assets/oil_icon.png",
  wheel: "/assets/wheel_service.svg",
  engine: "/assets/engine_service.svg",
  battery: "/assets/battery_service.svg",
  paint: "/assets/paint_service.svg",
} as const;

const SERVICE_ICON_OVERRIDES = [
  {
    icon: SERVICE_ICON_ASSETS.oil,
    words: ["oil-change", "oil change", "oil service", "lubrication"],
  },
];

const SERVICE_ICON_KEYWORDS = [
  {
    icon: SERVICE_ICON_ASSETS.wheel,
    words: ["wheel", "tire", "tyre", "rim", "alignment", "rotation"],
  },
  {
    icon: SERVICE_ICON_ASSETS.battery,
    words: ["battery", "electric", "electrical", "charging"],
  },
  {
    icon: SERVICE_ICON_ASSETS.paint,
    words: ["paint", "body", "dent", "scratch", "collision"],
  },
  {
    icon: SERVICE_ICON_ASSETS.engine,
    words: ["engine", "filter", "brake", "diagnostic", "repair"],
  },
];

const CAR_BRAND_ICONS: Record<string, IconType> = {
  alfa: SiAlfaromeo,
  "alfa romeo": SiAlfaromeo,
  aston: SiAstonmartin,
  "aston martin": SiAstonmartin,
  audi: SiAudi,
  benz: SiMercedes,
  bmw: SiBmw,
  chevrolet: SiChevrolet,
  chevy: SiChevrolet,
  citroen: SiCitroen,
  ferrari: SiFerrari,
  fiat: SiFiat,
  ford: SiFord,
  honda: SiHonda,
  hyundai: SiHyundai,
  jaguar: SiJaguar,
  jeep: SiJeep,
  kia: SiKia,
  lamborghini: SiLamborghini,
  "land rover": SiLandrover,
  landrover: SiLandrover,
  mazda: SiMazda,
  "mercedes benz": SiMercedes,
  mercedes: SiMercedes,
  mini: SiMini,
  mitsubishi: SiMitsubishi,
  nissan: SiNissan,
  opel: SiOpel,
  peugeot: SiPeugeot,
  porsche: SiPorsche,
  renault: SiRenault,
  seat: SiSeat,
  skoda: SiSkoda,
  subaru: SiSubaru,
  suzuki: SiSuzuki,
  tesla: SiTesla,
  toyota: SiToyota,
  volkswagen: SiVolkswagen,
  volvo: SiVolvo,
  vw: SiVolkswagen,
};

export function resolveBookingServiceIcon(
  booking: Pick<Booking, "serviceIcon" | "serviceId" | "serviceName">,
) {
  const searchable = `${booking.serviceId ?? ""} ${booking.serviceName}`.toLowerCase();
  for (const match of SERVICE_ICON_OVERRIDES) {
    if (match.words.some((word) => searchable.includes(word))) {
      return match.icon;
    }
  }

  const explicit = normalizeServiceIcon(booking.serviceIcon);
  if (explicit) return explicit;

  for (const match of SERVICE_ICON_KEYWORDS) {
    if (match.words.some((word) => searchable.includes(word))) {
      return match.icon;
    }
  }

  return SERVICE_ICON_ASSETS.engine;
}

export function resolveBookingCarIcon(make: string): IconType {
  return CAR_BRAND_ICONS[normalizeCarMake(make)] ?? FaCarSide;
}

function normalizeServiceIcon(value?: string | null) {
  const icon = value?.trim();
  if (!icon) return null;

  if (
    icon.startsWith("/") ||
    icon.startsWith("http://") ||
    icon.startsWith("https://") ||
    icon.startsWith("data:") ||
    icon.startsWith("blob:")
  ) {
    return icon;
  }

  if (icon.includes(".")) {
    return `/assets/${icon.replace(/^assets\//, "")}`;
  }

  const lower = icon.toLowerCase();
  for (const match of SERVICE_ICON_OVERRIDES) {
    if (match.words.some((word) => lower.includes(word))) {
      return match.icon;
    }
  }

  for (const match of SERVICE_ICON_KEYWORDS) {
    if (match.words.some((word) => lower.includes(word))) {
      return match.icon;
    }
  }

  return null;
}

function normalizeCarMake(make: string) {
  return make
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
