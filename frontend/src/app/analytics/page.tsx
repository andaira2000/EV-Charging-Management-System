import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Analytics from "@/components/Analytics";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Revenue, bookings and busy hours for your charging stations.",
};

const AnalyticsPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Analytics" />
      <Analytics />
    </DefaultLayout>
  );
};

export default AnalyticsPage;
