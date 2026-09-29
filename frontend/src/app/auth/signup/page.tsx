import React from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Signup from "@/components/Auth/Signup";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Sign up for a new account",
};

const SignUp: React.FC = () => {
  return (
    <DefaultLayout showUserSpecificContent={false}>
      <Breadcrumb pageName="Sign Up" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-wrap items-stretch">
          <div className="flex w-full flex-col xl:w-1/2">
            <div className="w-full flex-grow p-4 sm:p-12.5 xl:p-15">
              <Signup />
            </div>
          </div>

          <div className="hidden w-full p-7.5 xl:flex xl:w-1/2 xl:flex-col xl:items-center xl:justify-center">
            <div className="flex w-full flex-grow flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D5F9F7] to-[#A7EEEA] px-12.5 py-10 dark:from-[#0B4F5C] dark:to-[#0E5E68]">
              <Link className="mb-6 inline-block" href="/">
                <Logo size={110} showName={false} />
              </Link>
              <h1 className="mb-3 text-center text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                Welcome!
              </h1>
              <p className="max-w-sm text-center text-dark-4 dark:text-dark-7">
                Create an account to book charging slots, or to list your own
                stations on the map.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SignUp;
