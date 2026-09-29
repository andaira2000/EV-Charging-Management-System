"use client";
import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";

interface NotifyButtonProps {
  chargingStationId: number;
}

const NotifyButton = ({ chargingStationId }: NotifyButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  const handleNotify = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await Server.requestNotification(
        Cookies.get("accessToken") ?? "",
        chargingStationId,
      );

      if (response.ok) {
        setMessage({
          text: "You'll get an email when this station becomes available.",
          ok: true,
        });
      } else {
        setMessage({
          text: await getErrorMessage(
            response,
            "Could not set up the notification. Please try again.",
          ),
          ok: false,
        });
      }
    } catch (error) {
      console.error("Error requesting notification:", error);
      setMessage({ text: "Network error. Please try again later.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        style={{ marginTop: "10px" }}
        onClick={handleNotify}
        disabled={loading || message?.ok === true}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {loading ? "Saving…" : "Notify Me"}
      </Button>
      {message && (
        <div
          style={{
            marginTop: "8px",
            color: message.ok ? "#2e7d32" : "#d32f2f",
          }}
        >
          {message.text}
        </div>
      )}
    </>
  );
};

export default NotifyButton;
