import L from "leaflet";

export type StationState = "available" | "in_use" | "maintenance" | "out_of_order";

export const STATION_STATES: Record<
  StationState,
  { label: string; color: string }
> = {
  available: { label: "Available", color: "#22AD5C" },
  in_use: { label: "In use", color: "#3B82F6" },
  maintenance: { label: "Maintenance", color: "#F59E0B" },
  out_of_order: { label: "Out of order", color: "#EF4444" },
};

interface StationForState {
  availability_status: string;
  reservations: { start_time: string; end_time: string }[];
}

// The operator's status wins; otherwise a booking covering "now" means in use.
export const getStationState = (
  station: StationForState,
  now: Date = new Date(),
): StationState => {
  if (station.availability_status === "out_of_order") return "out_of_order";
  if (station.availability_status === "maintenance") return "maintenance";

  const isBookedNow = station.reservations.some(
    (reservation) =>
      new Date(reservation.start_time) <= now &&
      new Date(reservation.end_time) >= now,
  );
  return isBookedNow ? "in_use" : "available";
};

// A map pin drawn as SVG, so each state can have its own colour without
// separate image files.
const createPinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="#ffffff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
  });

export const STATION_ICONS = Object.fromEntries(
  Object.entries(STATION_STATES).map(([state, { color }]) => [
    state,
    createPinIcon(color),
  ]),
) as Record<StationState, L.DivIcon>;
