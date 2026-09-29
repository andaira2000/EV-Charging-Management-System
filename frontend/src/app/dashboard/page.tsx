import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Find charging stations",
  description: "Find charging stations on a live map and book a slot.",
};

export default function Home() {
  const OpenChargeMap = useMemo(
    () =>
      dynamic(() => import("@/components/Dashboard"), {
        ssr: false,
      }),
    [],
  );
  return (
    <>
      <DefaultLayout>
        <OpenChargeMap />
      </DefaultLayout>
    </>
  );
}
