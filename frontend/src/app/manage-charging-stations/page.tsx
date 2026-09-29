import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ManageStations from "@/components/ManageChargingStations";

export const metadata: Metadata = {
  title: "Manage stations",
  description: "Add and edit your charging stations.",
};

const ManageChargingStations = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Manage Charging Stations" />
      <div className="flex flex-col gap-6">
        <ManageStations />
      </div>
    </DefaultLayout>
  );
};

export default ManageChargingStations;
