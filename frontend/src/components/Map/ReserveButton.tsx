"use client";
import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
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
      <Button
        variant="contained"
        color="primary"
        type="submit"
        style={{ marginTop: "10px" }}
        onClick={handleReserve}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {loading ? "Opening checkout…" : "Reserve"}
      </Button>
      {error && (
        <div style={{ marginTop: "8px", color: "#d32f2f" }}>{error}</div>
      )}
    </>
  );
};

export default ReserveButton;
