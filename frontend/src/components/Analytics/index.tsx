"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";
import Tabs from "@/components/common/Tabs";
import { formatDuration, formatPounds } from "@/lib/format";
import ChartCard from "./ChartCard";
import StatTile from "./StatTile";
import RevenueChart, { RevenueTable } from "./RevenueChart";
import StationBookingsChart, {
  StationBookingsTable,
} from "./StationBookingsChart";
import BusyHoursHeatmap, { BusyHoursTable } from "./BusyHoursHeatmap";
import { SellerAnalytics as Data } from "./types";

const PERIODS = [7, 30, 90] as const;

const wholePounds = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

const SellerAnalytics = () => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await Server.getSellerAnalytics(
          Cookies.get("accessToken") ?? "",
          days,
        );
        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Could not load your analytics.",
          );
          if (!cancelled) setError(message);
          return;
        }
        const json: Data = await response.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Network error. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    // Ignore a slow response if the period changed in the meantime.
    return () => {
      cancelled = true;
    };
  }, [days]);

  const periodLabel = `${days} days`;

  return (
    <div className="space-y-6">
      {/* One row of period tabs that scopes everything below it */}
      <Tabs
        tabs={PERIODS.map((p) => ({ value: p, label: `Last ${p} days` }))}
        active={days}
        onChange={setDays}
        busy={loading && data !== null}
      />

      {error && <p className="font-medium text-red-500">{error}</p>}

      {!data && loading && (
        <div className="rounded-lg bg-white p-10 text-center shadow-md dark:bg-dark-2">
          <div className="flex items-center justify-center gap-2 text-dark-5 dark:text-dark-6">
            <Spinner /> Loading your analytics…
          </div>
          <SlowServerHint active={loading} />
        </div>
      )}

      {data && (
        // While a new period loads, keep the old numbers on screen, faded.
        <div
          className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          {data.station_count === 0 ? (
            <div className="rounded-lg bg-white p-10 text-center shadow-md dark:bg-dark-2">
              <p className="font-medium text-dark dark:text-white">
                You don&apos;t have any stations yet.
              </p>
              <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                Add a station under Manage Charging Stations to start seeing
                analytics.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile
                  label="Revenue"
                  value={wholePounds(data.summary.revenue)}
                  current={data.summary.revenue}
                  previous={data.previous.revenue}
                  upIsGood
                  periodLabel={periodLabel}
                />
                <StatTile
                  label="Bookings"
                  value={data.summary.bookings.toLocaleString("en-GB")}
                  current={data.summary.bookings}
                  previous={data.previous.bookings}
                  upIsGood
                  periodLabel={periodLabel}
                />
                <StatTile
                  label="Average session"
                  value={formatDuration(data.summary.avg_session_minutes * 60000)}
                  current={data.summary.avg_session_minutes}
                  previous={data.previous.avg_session_minutes}
                  upIsGood={null}
                  periodLabel={periodLabel}
                />
                <StatTile
                  label="Utilisation"
                  value={`${(data.summary.utilisation * 100).toFixed(1)}%`}
                  current={data.summary.utilisation}
                  previous={data.previous.utilisation}
                  upIsGood
                  periodLabel={periodLabel}
                />
              </div>

              <ChartCard
                title="Revenue per day"
                subtitle={`${formatPounds(data.summary.revenue)} over the last ${periodLabel}`}
                chart={<RevenueChart daily={data.daily} />}
                table={<RevenueTable daily={data.daily} />}
              />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <ChartCard
                  className="xl:col-span-2"
                  title="Bookings per station"
                  subtitle="Busiest first"
                  chart={<StationBookingsChart stations={data.stations} />}
                  table={<StationBookingsTable stations={data.stations} />}
                />
                <ChartCard
                  className="xl:col-span-3"
                  title="Busy hours"
                  subtitle="When bookings start, by weekday and hour (UK time)"
                  chart={<BusyHoursHeatmap cells={data.busy_hours} />}
                  table={<BusyHoursTable cells={data.busy_hours} />}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Analytics = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  if (role === null) return null;

  if (role !== "seller") {
    return (
      <div className="rounded-lg bg-white p-10 text-center shadow-md dark:bg-dark-2">
        <p className="font-medium text-dark dark:text-white">
          Analytics are for station operators for now.
        </p>
        <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
          A driver&apos;s view of your charging history is coming soon.
        </p>
      </div>
    );
  }

  return <SellerAnalytics />;
};

export default Analytics;
