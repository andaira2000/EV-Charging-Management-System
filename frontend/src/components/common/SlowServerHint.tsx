"use client";
import { useEffect, useState } from "react";

// The backend runs on Render's free plan and sleeps when idle, so the first
// request can take up to a minute. Explain that if a request is slow.
const SlowServerHint = ({
  active,
  delayMs = 5000,
}: {
  active: boolean;
  delayMs?: number;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  if (!show) return null;

  return (
    <p className="mt-3 text-center text-sm text-dark-5 dark:text-dark-6">
      The server is waking up. This can take up to a minute the first time.
    </p>
  );
};

export default SlowServerHint;
