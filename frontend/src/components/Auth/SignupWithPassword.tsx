"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";

export default function SignupWithPassword() {
  const [data, setData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    role: "buyer", // Default role for signup
    is_seller: false, // New field to track if the user wants to sell energy
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (data.password !== data.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Update role based on the checkbox
      const signupData = { ...data, role: data.is_seller ? "seller" : "buyer" };

      const response = await Server.signup(signupData);

      if (response.ok) {
        setSuccess("Account created successfully. Please sign in.");
        setData({
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          confirm_password: "",
          role: "buyer",
          is_seller: false,
        });
        window.location.href = "/auth/signin";
      } else {
        setError(
          await getErrorMessage(response, "Sign up failed. Please try again."),
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

      <div className="mb-4">
        <label
          htmlFor="first_name"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          First Name
        </label>
        <input
          type="text"
          name="first_name"
          value={data.first_name}
          onChange={handleChange}
          placeholder="Enter your first name"
          className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="last_name"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Last Name
        </label>
        <input
          type="text"
          name="last_name"
          value={data.last_name}
          onChange={handleChange}
          placeholder="Enter your last name"
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

      <div className="mb-5">
        <label
          htmlFor="confirm_password"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Confirm Password
        </label>
        <input
          type="password"
          name="confirm_password"
          value={data.confirm_password}
          onChange={handleChange}
          placeholder="Confirm your password"
          className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        />
      </div>

      <div className="mb-5">
        <label className="mb-2.5 block font-medium text-dark dark:text-white">
          <input
            type="checkbox"
            name="is_seller"
            checked={data.is_seller}
            onChange={handleChange}
            className="mr-2"
          />
          I also want to sell energy
        </label>
      </div>

      {error && <div className="mb-4 font-medium text-red-500">{error}</div>}
      {success && (
        <div className="mb-4 font-medium text-green-500">{success}</div>
      )}

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Spinner />}
          {loading ? "Creating account…" : "Create an account"}
        </button>
        <SlowServerHint active={loading} />
      </div>

      <div className="text-center">
        <p>
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
