import { Metadata } from "next";
import React from "react";
import Dashboard from "@/app/dashboard/page";

export const metadata: Metadata = {
  title: "Find charging stations",
  description: "Find charging stations on a live map and book a slot.",
};

const Home = () => {
  return (
    <>
      <Dashboard />
    </>
  );
};

export default Home;
