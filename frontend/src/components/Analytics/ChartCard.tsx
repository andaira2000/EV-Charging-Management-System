"use client";
import { useState } from "react";

// A card with a title and a Chart / Table switch. Every chart also has a
// table version, so no value is only readable by hovering.
const ChartCard = ({
  title,
  subtitle,
  chart,
  table,
  className = "",
}: {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  table: React.ReactNode;
  className?: string;
}) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <section
      className={`viz rounded-lg bg-white p-5 shadow-md dark:bg-dark-2 sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-dark dark:text-white">{title}</h3>
          {subtitle && (
            <div className="mt-0.5 text-sm text-dark-5 dark:text-dark-6">
              {subtitle}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          aria-pressed={showTable}
          className="shrink-0 rounded-md border border-stroke px-2.5 py-1 text-xs font-medium text-dark-5 hover:bg-gray-2 dark:border-dark-3 dark:text-dark-6 dark:hover:bg-dark-3"
        >
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>
      {showTable ? (
        <div className="max-h-[320px] overflow-auto">{table}</div>
      ) : (
        chart
      )}
    </section>
  );
};

export default ChartCard;

// Compact table styling shared by the chart tables.
export const vizTableClass =
  "w-full text-left text-sm tabular-nums [&_td]:border-t [&_td]:border-stroke [&_td]:px-3 [&_td]:py-2 [&_th]:sticky [&_th]:top-0 [&_th]:bg-gray-1 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-dark-5 dark:[&_td]:border-dark-3 dark:[&_th]:bg-dark-3 dark:[&_th]:text-dark-6 text-dark dark:text-white";
