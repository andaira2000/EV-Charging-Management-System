"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";

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

  useEffect(() => {
    const fetchReservations = async () => {
      const token = Cookies.get("accessToken") ?? "";
      try {
        const response = await Server.getUserReservations(token);
        const data = await response.json();
        console.log("Reservations", data);
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
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

  const calculateBatteryLevel = (startTime: Date, endTime: Date) => {
    const now = currentTime;
    const totalDuration = endTime.getTime() - startTime.getTime();
    const elapsed = now.getTime() - startTime.getTime();
    const batteryLevel = Math.min(
      Math.max((elapsed / totalDuration) * 100, 0),
      100,
    );
    return `${Math.floor(batteryLevel)}%`;
  };

  const calculateTimeToFullCharge = (endTime: Date) => {
    const now = currentTime;
    const timeRemaining = Math.max(endTime.getTime() - now.getTime(), 0);
    const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
    return `${minutesRemaining} minutes`;
  };

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
    try {
      await Server.cancelReservation(token, reservationToCancel);
      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== reservationToCancel),
      );
      alert("Reservation canceled successfully.");
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("Failed to cancel reservation. Please try again.");
    } finally {
      closeCancelPopup();
    }
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

      {/* Table */}
      <div className="mx-auto w-full max-w-7xl overflow-x-auto bg-white shadow-md dark:bg-dark-2">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b dark:border-dark-3">
              <th className="px-6 py-4">Location</th>
              {activeTab === "active" ? (
                <>
                  <th className="px-6 py-4">Battery Level</th>
                  <th className="px-6 py-4">Time to Full Charge</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">End Time</th>
                </>
              )}
              {(activeTab === "active" || activeTab === "upcoming") && (
                <th className="px-6 py-4">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                >
                  <td className="px-6 py-4">{reservation.charging_station}</td>
                  {activeTab === "active" ? (
                    <>
                      <td className="px-6 py-4">
                        {calculateBatteryLevel(
                          new Date(reservation.start_time),
                          new Date(reservation.end_time),
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {calculateTimeToFullCharge(
                          new Date(reservation.end_time),
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        {new Date(reservation.start_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(reservation.end_time).toLocaleString()}
                      </td>
                    </>
                  )}
                  {(activeTab === "active" || activeTab === "upcoming") && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openCancelPopup(reservation.id)}
                        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    activeTab === "active" || activeTab === "upcoming" ? 4 : 3
                  }
                  className="px-6 py-4 text-center"
                >
                  No reservations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
