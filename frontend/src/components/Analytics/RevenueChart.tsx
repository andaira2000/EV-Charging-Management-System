"use client";
import { useState } from "react";
import useElementWidth from "@/hooks/useElementWidth";
import { formatPounds } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";
import { vizTableClass } from "./ChartCard";
import { DailyPoint } from "./types";

const HEIGHT = 240; // plot + x-axis band
const MARGIN = { top: 12, right: 12, bottom: 28, left: 56 };

const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});
const longDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const toDate = (iso: string) => new Date(`${iso}T12:00:00`);

// A round tick step for four gridlines, e.g. 523 -> 200 (axis 0-800), so
// every tick is a clean number.
const niceStep = (value: number) => {
  if (value <= 0) return 25;
  const rough = value / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= rough)! * magnitude;
};

const compactPounds = (value: number) =>
  value >= 1000
    ? `£${Number((value / 1000).toFixed(1))}k`
    : `£${Number(value.toFixed(0))}`;

export const RevenueTable = ({ daily }: { daily: DailyPoint[] }) => (
  <table className={vizTableClass}>
    <thead>
      <tr>
        <th>Date</th>
        <th className="text-right">Bookings</th>
        <th className="text-right">Revenue</th>
      </tr>
    </thead>
    <tbody>
      {[...daily].reverse().map((day) => (
        <tr key={day.date}>
          <td>{longDate.format(toDate(day.date))}</td>
          <td className="text-right">{day.bookings}</td>
          <td className="text-right">{formatPounds(day.revenue)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const RevenueChart = ({ daily }: { daily: DailyPoint[] }) => {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const step = niceStep(Math.max(...daily.map((d) => d.revenue), 0));
  const max = step * 4;
  const x = (i: number) =>
    MARGIN.left + (daily.length > 1 ? (i / (daily.length - 1)) * plotWidth : 0);
  const y = (value: number) => MARGIN.top + plotHeight - (value / max) * plotHeight;

  const line = daily
    .map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(daily.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const yTicks = [0, 1, 2, 3, 4].map((n) => n * step);
  const xTickEvery = Math.max(Math.ceil(daily.length / Math.max(Math.floor(plotWidth / 90), 1)), 1);

  // Snap the crosshair to the nearest day.
  const onPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - box.left) / box.width;
    setActive(Math.round(ratio * (daily.length - 1)));
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (active ?? daily.length - 1) + (e.key === "ArrowRight" ? 1 : -1);
    setActive(Math.min(Math.max(next, 0), daily.length - 1));
  };

  const point = active !== null ? daily[active] : null;

  return (
    <div ref={ref} className="relative" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="Revenue per day. Use the arrow keys to read each day."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((a) => a ?? daily.length - 1)}
          onBlur={() => setActive(null)}
          className="outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {/* Gridlines and y-axis labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotWidth}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-dark-5 text-[11px] tabular-nums dark:fill-dark-6"
              >
                {compactPounds(tick)}
              </text>
            </g>
          ))}

          {/* X-axis date labels: evenly spaced, and always the last day
              (right-aligned so it isn't cut off at the edge) */}
          {daily.map((d, i) => {
            const last = daily.length - 1;
            const show =
              i === last ||
              (i % xTickEvery === 0 && last - i >= xTickEvery / 2);
            if (!show) return null;
            return (
              <text
                key={d.date}
                x={x(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
                className="fill-dark-5 text-[11px] dark:fill-dark-6"
              >
                {shortDate.format(toDate(d.date))}
              </text>
            );
          })}

          {/* The data: a light wash under a 2px line */}
          <path d={area} fill="var(--viz-series-wash)" />
          <path
            d={line}
            fill="none"
            stroke="var(--viz-series)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Crosshair and marker for the hovered day */}
          {point && active !== null && (
            <g>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
              <circle
                cx={x(active)}
                cy={y(point.revenue)}
                r={5}
                fill="var(--viz-series)"
                stroke="var(--viz-surface)"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Invisible hit area over the whole plot */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}

      {point && active !== null && (
        <ChartTooltip
          x={x(active)}
          y={y(point.revenue)}
          containerWidth={width}
          value={formatPounds(point.revenue)}
          label={`${longDate.format(toDate(point.date))} · ${point.bookings} booking${point.bookings === 1 ? "" : "s"}`}
        />
      )}
    </div>
  );
};

export default RevenueChart;
