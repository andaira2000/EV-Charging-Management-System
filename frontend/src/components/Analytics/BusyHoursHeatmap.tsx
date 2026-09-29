"use client";
import { useState } from "react";
import { vizTableClass } from "./ChartCard";
import { BusyHourCell } from "./types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const STEPS = 5;

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
const bookingsLabel = (n: number) => `${n} booking${n === 1 ? "" : "s"}`;

// grid[weekday 0-6][hour 0-23] = bookings
const toGrid = (cells: BusyHourCell[]) => {
  const grid = WEEKDAYS.map(() => HOURS.map(() => 0));
  cells.forEach((c) => (grid[c.weekday - 1][c.hour] = c.bookings));
  return grid;
};

// 0 bookings -> neutral step 0; otherwise one of 5 steps of one hue.
const stepFor = (value: number, max: number) =>
  value === 0 ? 0 : Math.max(1, Math.ceil((value / max) * STEPS));

export const BusyHoursTable = ({ cells }: { cells: BusyHourCell[] }) => {
  const grid = toGrid(cells);
  return (
    <table className={vizTableClass}>
      <thead>
        <tr>
          <th>Hour</th>
          {WEEKDAYS.map((d) => (
            <th key={d} className="text-right">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {HOURS.map((h) => (
          <tr key={h}>
            <td>{hourLabel(h)}</td>
            {grid.map((row, d) => (
              <td key={d} className="text-right">
                {row[h]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const BusyHoursHeatmap = ({ cells }: { cells: BusyHourCell[] }) => {
  const [active, setActive] = useState<{ d: number; h: number } | null>(null);
  const grid = toGrid(cells);
  const max = Math.max(...cells.map((c) => c.bookings), 1);

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[520px] gap-[2px]"
          style={{ gridTemplateColumns: "36px repeat(24, minmax(0, 1fr))" }}
          onPointerLeave={() => setActive(null)}
        >
          {/* Hour labels every 3 hours */}
          <div />
          {HOURS.map((h) => (
            <div
              key={h}
              className="pb-1 text-[11px] text-dark-5 dark:text-dark-6"
            >
              {h % 3 === 0 ? h : ""}
            </div>
          ))}

          {grid.map((row, d) => (
            <div key={WEEKDAYS[d]} className="contents">
              <div className="flex items-center text-xs text-dark-5 dark:text-dark-6">
                {WEEKDAYS[d]}
              </div>
              {row.map((value, h) => {
                const isActive = active?.d === d && active?.h === h;
                return (
                  <div
                    key={h}
                    tabIndex={0}
                    aria-label={`${WEEKDAYS[d]} ${hourLabel(h)}: ${bookingsLabel(value)}`}
                    onPointerEnter={() => setActive({ d, h })}
                    onFocus={() => setActive({ d, h })}
                    onBlur={() => setActive(null)}
                    className="aspect-square rounded-[3px] outline-none"
                    style={{
                      backgroundColor: `var(--viz-heat-${stepFor(value, max)})`,
                      boxShadow: isActive
                        ? "0 0 0 2px var(--viz-surface), 0 0 0 3.5px currentColor"
                        : undefined,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Readout of the hovered cell and the scale legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-dark-5 dark:text-dark-6">
        <div className="min-h-[1rem]" aria-live="polite">
          {active ? (
            <>
              <span className="font-semibold text-dark dark:text-white">
                {bookingsLabel(grid[active.d][active.h])}
              </span>{" "}
              · {WEEKDAYS[active.d]} {hourLabel(active.h)}–
              {hourLabel((active.h + 1) % 24)}
            </>
          ) : (
            "Hover over a square to see its bookings."
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span>None</span>
          <span
            className="inline-block h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: "var(--viz-heat-0)" }}
          />
          <span className="ml-2">Fewer</span>
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              className="inline-block h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: `var(--viz-heat-${i + 1})` }}
            />
          ))}
          <span>More (max {max})</span>
        </div>
      </div>
    </div>
  );
};

export default BusyHoursHeatmap;
