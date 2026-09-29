import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Reservations from "@/components/Reservations";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Your active, upcoming and past reservations.",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="My Reservations" />
        <div className="flex flex-col gap-10">
          <Reservations />
        </div>
      </DefaultLayout>
    </>
  );
}
