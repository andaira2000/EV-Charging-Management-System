import type { Metadata } from "next";
import "@/css/satoshi.css";
import "@/css/style.css";
import React from "react";

// Pages set their own title, e.g. "Payments", which becomes
// "Payments | EV Charging".
export const metadata: Metadata = {
  title: {
    template: "%s | EV Charging",
    default: "EV Charging",
  },
  description:
    "Find EV charging stations on a live map, book a time slot and pay online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
