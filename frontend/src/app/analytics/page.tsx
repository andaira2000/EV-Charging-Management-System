import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Analytics",
  description: "The most visited charging station.",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName = "Most Visited Charging Station" />

      <div className="flex flex-col gap-10">
        <TableOne />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
