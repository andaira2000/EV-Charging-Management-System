import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Find Charging Stations",
  description: "Find charging stations",
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
