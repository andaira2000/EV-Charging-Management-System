import OpenChargeMap from "@/components/Dashboard";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata: Metadata = {
  title: "Find Charging Stations",
  description: "Find charging stations",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <div className="w-full max-w-[970px]">
          <Breadcrumb pageName="" />

          <OpenChargeMap />
        </div>
      </DefaultLayout>
    </>
  );
}
