"use client";
import { useState } from "react";
import { splitLocation } from "@/lib/stations";
import { formatPounds } from "@/lib/format";
import { vizTableClass } from "./ChartCard";
import { StationPoint } from "./types";

const bookingsLabel = (n: number) => `${n} booking${n === 1 ? "" : "s"}`;

export const StationBookingsTable = ({
  stations,
}: {
  stations: StationPoint[];
}) => (
  <table className={vizTableClass}>
    <thead>
      <tr>
        <th>Station</th>
        <th className="text-right">Bookings</th>
        <th className="text-right">Revenue</th>
      </tr>
    </thead>
    <tbody>
      {stations.map((station) => (
        <tr key={station.station_id}>
          <td>{splitLocation(station.location).name}</td>
          <td className="text-right">{station.bookings}</td>
          <td className="text-right">{formatPounds(station.revenue)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// One series, so every bar shares one colour; the value sits at the tip.
const StationBookingsChart = ({ stations }: { stations: StationPoint[] }) => {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...stations.map((s) => s.bookings), 1);

  return (
    <ul className="space-y-3">
      {stations.map((station) => {
        const { name } = splitLocation(station.location);
        const isActive = active === station.station_id;

        return (
          <li
            key={station.station_id}
            tabIndex={0}
            onPointerEnter={() => setActive(station.station_id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(station.station_id)}
            onBlur={() => setActive(null)}
            aria-label={`${name}: ${bookingsLabel(station.bookings)}, ${formatPounds(station.revenue)} revenue`}
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-dark dark:text-white">{name}</span>
              <span
                className={`shrink-0 text-xs text-dark-5 transition-opacity dark:text-dark-6 ${isActive ? "opacity-100" : "opacity-0"}`}
              >
                {formatPounds(station.revenue)} revenue
              </span>
            </div>
            <div className="flex h-5 items-center">
              <div
                className="h-full shrink-0 rounded-r transition-[filter] duration-150"
                style={{
                  // The longest bar uses 88% of the row, leaving room for its value.
                  width: `${(station.bookings / max) * 88}%`,
                  minWidth: station.bookings ? 3 : 0,
                  backgroundColor: "var(--viz-series)",
                  filter: isActive ? "brightness(1.15)" : undefined,
                }}
              />
              <span className="ml-2 text-sm font-semibold text-dark dark:text-white">
                {station.bookings}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default StationBookingsChart;
