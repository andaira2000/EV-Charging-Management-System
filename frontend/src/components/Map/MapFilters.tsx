"use client";
import { useEffect, useState } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import ClickOutside from "@/components/ClickOutside";
import { STATION_STATES, StationState } from "@/lib/stations";

export interface MapFilterValues {
  minPowerKw: number;
  status: StationState | "all";
}

export const DEFAULT_MAP_FILTERS: MapFilterValues = {
  minPowerKw: 0,
  status: "all",
};

const POWER_OPTIONS = [0, 7, 22, 50, 150];

interface MapFiltersProps {
  filters: MapFilterValues;
  setFilters: (filters: MapFilterValues) => void;
}

const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition ${
      active
        ? "border-primary bg-primary text-white"
        : "border-stroke bg-white text-dark hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
    }`}
  >
    {children}
  </button>
);

// Filters apply immediately, so the pins update while the panel is open.
const MapFilters = ({ filters, setFilters }: MapFiltersProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const activeCount =
    (filters.status !== DEFAULT_MAP_FILTERS.status ? 1 : 0) +
    (filters.minPowerKw !== DEFAULT_MAP_FILTERS.minPowerKw ? 1 : 0);

  return (
    <ClickOutside
      onClick={() => setOpen(false)}
      className="absolute right-3 top-3 z-[1000] flex flex-col items-end"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 font-medium text-dark shadow-md hover:bg-gray-2 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
      >
        <TuneIcon fontSize="small" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 w-[min(340px,calc(100vw-3rem))] rounded-lg bg-white p-4 shadow-lg dark:bg-dark-2">
          <div className="mb-2 text-sm font-semibold text-dark dark:text-white">
            Status
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill
              active={filters.status === "all"}
              onClick={() => setFilters({ ...filters, status: "all" })}
            >
              All
            </Pill>
            {Object.entries(STATION_STATES).map(([state, { label, color }]) => (
              <Pill
                key={state}
                active={filters.status === state}
                onClick={() =>
                  setFilters({ ...filters, status: state as StationState })
                }
              >
                <span
                  className="inline-block h-2 w-2 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: color }}
                />
                {label}
              </Pill>
            ))}
          </div>

          <div className="mb-2 mt-4 text-sm font-semibold text-dark dark:text-white">
            Minimum power
          </div>
          <div className="flex flex-wrap gap-2">
            {POWER_OPTIONS.map((kw) => (
              <Pill
                key={kw}
                active={filters.minPowerKw === kw}
                onClick={() => setFilters({ ...filters, minPowerKw: kw })}
              >
                {kw === 0 ? "Any" : `${kw}+ kW`}
              </Pill>
            ))}
          </div>

          {activeCount > 0 && (
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_MAP_FILTERS)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </ClickOutside>
  );
};

export default MapFilters;
