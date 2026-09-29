"use client";
import React, { useState } from "react";
import Spinner from "@/components/common/Spinner";
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
      <button
        type="button"
        onClick={handleNotify}
        disabled={loading || message?.ok === true}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading && <Spinner className="h-4 w-4" />}
        {loading ? "Saving…" : "Notify me"}
      </button>
      {message && (
        <div
          className={`mt-2 text-sm ${message.ok ? "text-green-dark" : "text-red"}`}
        >
          {message.text}
        </div>
      )}
    </>
  );
};

export default NotifyButton;
