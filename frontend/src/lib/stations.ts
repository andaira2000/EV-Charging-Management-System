// Station states, labels and colours shared by the map and the tables.
// Kept free of Leaflet so server-rendered pages can import it.

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

// The values the backend accepts for a station's operator-set status.
export const AVAILABILITY_OPTIONS = [
  "available",
  "maintenance",
  "out_of_order",
] as const;

export const SPEED_LABELS: Record<string, string> = {
  fast: "Fast",
  slow: "Slow",
};

export const CONNECTOR_LABELS: Record<string, string> = {
  type1: "Type 1",
  type2: "Type 2",
  ccs: "CCS",
  chademo: "CHAdeMO",
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

// "King's Cross, Pancras Road, London N1C 4AB" → name + rest of the address.
export const splitLocation = (location: string) => {
  const [name, ...rest] = location.split(",");
  return { name: name.trim(), address: rest.join(",").trim() };
};
