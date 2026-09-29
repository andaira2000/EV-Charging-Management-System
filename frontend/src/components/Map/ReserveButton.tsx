"use client";
import React, { useState } from "react";
import Spinner from "@/components/common/Spinner";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";

interface ReserveButtonProps {
  chargingStationId: number;
  startTime: string;
  endTime: string;
}

const ReserveButton = ({
  chargingStationId,
  startTime,
  endTime,
}: ReserveButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReserve = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await Server.createCheckoutSession(
        Cookies.get("accessToken") ?? "",
        chargingStationId,
        startTime,
        endTime,
      );

      if (!response.ok) {
        setError(
          await getErrorMessage(
            response,
            "Could not reserve this station. Please try again.",
          ),
        );
        setLoading(false);
        return;
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout. Keep the loading state until it opens.
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Network error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading && <Spinner className="h-4 w-4" />}
        {loading ? "Opening checkout…" : "Reserve"}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red">{error}</div>
      )}
    </>
  );
};

export default ReserveButton;
