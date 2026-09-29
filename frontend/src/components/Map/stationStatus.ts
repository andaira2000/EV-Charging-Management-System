import L from "leaflet";
import { STATION_STATES, StationState } from "@/lib/stations";

export { STATION_STATES, getStationState } from "@/lib/stations";
export type { StationState } from "@/lib/stations";

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
