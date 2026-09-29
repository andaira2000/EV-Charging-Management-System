import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Payments from "@/components/Payments";

export const metadata: Metadata = {
  title: "Payments",
  description: "Your payment history and invoices.",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="My Payments" />
        <div className="flex flex-col gap-10">
          <Payments />
        </div>
      </DefaultLayout>
    </>
  );
}
