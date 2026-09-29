"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";
import {
  Badge,
  LocationCell,
  TableCard,
  TableMessageRow,
  Td,
  Th,
} from "@/components/common/Table";
import { formatDuration, formatTimeRange } from "@/lib/format";

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "past">(
    "active",
  );
  const [showPopup, setShowPopup] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(
    null,
  );

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = Cookies.get("accessToken") ?? "";
      try {
        const response = await Server.getUserReservations(token);
        if (!response.ok) {
          setError(
            await getErrorMessage(response, "Could not load your reservations."),
          );
          return;
        }
        setReservations(await response.json());
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // How far through the booked slot we are, from 0 to 100.
  const calculateProgress = (startTime: Date, endTime: Date) => {
    const totalDuration = endTime.getTime() - startTime.getTime();
    const elapsed = currentTime.getTime() - startTime.getTime();
    return Math.floor(
      Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100),
    );
  };

  const calculateTimeLeft = (endTime: Date) =>
    formatDuration(Math.max(endTime.getTime() - currentTime.getTime(), 0));

  const getFilteredReservations = () => {
    const now = currentTime;

    switch (activeTab) {
      case "active":
        return reservations.filter(
          (res) =>
            new Date(res.start_time) <= now && new Date(res.end_time) >= now,
        );
      case "upcoming":
        return reservations.filter((res) => new Date(res.start_time) > now);
      case "past":
        return reservations.filter((res) => new Date(res.end_time) < now);
      default:
        return reservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  const openCancelPopup = (reservationId: string) => {
    setReservationToCancel(reservationId);
    setShowPopup(true);
  };

  const closeCancelPopup = () => {
    setShowPopup(false);
    setReservationToCancel(null);
  };

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return;

    const token = Cookies.get("accessToken") ?? "";
    setError("");
    setCancelling(true);
    try {
      const response = await Server.cancelReservation(
        token,
        reservationToCancel,
      );
      if (response.ok) {
        setReservations((prev) =>
          prev.filter((reservation) => reservation.id !== reservationToCancel),
        );
      } else {
        setError(
          await getErrorMessage(
            response,
            "Failed to cancel the reservation. Please try again.",
          ),
        );
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      setError("Network error. Please try again later.");
    } finally {
      setCancelling(false);
      closeCancelPopup();
    }
  };

  const canCancel = activeTab === "active" || activeTab === "upcoming";

  const emptyMessages = {
    active: "You're not charging anywhere right now.",
    upcoming: "You have no upcoming reservations.",
    past: "You have no past reservations yet.",
  };

  return (
    <div className="w-full p-6">
      {/* Tabs */}
      <ul className="mx-auto mb-6 flex w-full max-w-7xl items-center justify-center gap-4">
        {["active", "upcoming", "past"].map((tab, index) => (
          <React.Fragment key={tab}>
            <li className="flex-1 text-center">
              <button
                onClick={() => setActiveTab(tab as any)}
                className={`group relative w-full rounded-[7px] px-3.5 py-3 font-medium duration-300 ease-in-out ${
                  activeTab === tab
                    ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                    : "text-dark-4 hover:bg-gray-100 hover:shadow-md dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
            {index < 2 && (
              <li className="hidden text-gray-400 dark:text-gray-600 md:block">
                |
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>

      {error && (
        <p className="mx-auto mb-4 max-w-7xl font-medium text-red-500">
          {error}
        </p>
      )}

      {/* Table */}
      <TableCard>
        <thead>
          <tr>
            <Th>Location</Th>
            {activeTab === "active" ? (
              <>
                <Th>Session progress</Th>
                <Th>Time left</Th>
              </>
            ) : (
              <>
                <Th>When</Th>
                <Th>Duration</Th>
              </>
            )}
            <Th>Payment</Th>
            {canCancel && <Th className="text-right">Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => {
              const start = new Date(reservation.start_time);
              const end = new Date(reservation.end_time);
              const progress = calculateProgress(start, end);

              return (
                <tr
                  key={reservation.id}
                  className="hover:bg-gray-1 dark:hover:bg-dark-3"
                >
                  <Td>
                    <LocationCell location={reservation.charging_station} />
                  </Td>
                  {activeTab === "active" ? (
                    <>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-3 dark:bg-dark-4">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="w-10">{progress}%</span>
                        </div>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {calculateTimeLeft(end)}
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td className="whitespace-nowrap">
                        {formatTimeRange(start, end)}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {formatDuration(end.getTime() - start.getTime())}
                      </Td>
                    </>
                  )}
                  <Td>
                    {reservation.is_paid === true && (
                      <Badge color="#22AD5C">Paid</Badge>
                    )}
                    {reservation.is_paid === false && (
                      <Badge color="#F59E0B">Awaiting payment</Badge>
                    )}
                  </Td>
                  {canCancel && (
                    <Td className="text-right">
                      <button
                        onClick={() => openCancelPopup(reservation.id)}
                        className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Cancel
                      </button>
                    </Td>
                  )}
                </tr>
              );
            })
          ) : (
            <TableMessageRow colSpan={canCancel ? 5 : 4}>
              {loading ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    Loading your reservations…
                  </div>
                  <SlowServerHint active={loading} />
                </>
              ) : (
                <>
                  <p className="font-medium text-dark dark:text-white">
                    {emptyMessages[activeTab]}
                  </p>
                  <p className="mt-1 text-sm">
                    <Link href="/dashboard" className="text-primary">
                      Find a charging station on the map
                    </Link>{" "}
                    to book a slot.
                  </p>
                </>
              )}
            </TableMessageRow>
          )}
        </tbody>
      </TableCard>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeCancelPopup}
          ></div>
          <div className="z-60 relative rounded bg-white p-6 shadow-lg dark:bg-dark-3">
            <h2 className="mb-4 text-lg font-bold">Cancel Reservation</h2>
            <p className="mb-4">
              Are you sure you want to cancel this reservation?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeCancelPopup}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                No
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cancelling && <Spinner className="h-4 w-4" />}
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
