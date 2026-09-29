"use client";
import React, { useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";

interface SignInData {
  email: string;
  password: string;
}

const SigninWithPassword: React.FC = () => {
  const [data, setData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await Server.login(data);

      if (response.ok) {
        const responseJSON = await response.json();

        Cookies.set("accessToken", responseJSON.access);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(responseJSON.userProfile),
        );
        localStorage.setItem("role", responseJSON.userProfile.role);

        console.log("Sign in successful");

        // Keep the loading state until the dashboard has loaded.
        window.location.href = "/dashboard";
      } else {
        setError(
          await getErrorMessage(response, "Sign in failed. Please try again."),
        );
        setLoading(false);
      }
    } catch (error) {
      setError("Network error. Please try again later.");
      console.error("Network error:", error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        />
      </div>
      <div className="mb-5">
        <label
          htmlFor="password"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        />
      </div>

      {error && <div className="mb-4 font-medium text-red-500">{error}</div>}

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Spinner />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <SlowServerHint active={loading} />
      </div>

      <div className="text-center">
        <p>
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SigninWithPassword;
