"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SignupWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    role: "buyer", // Default role for signup
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for signing up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    setSuccess(""); // Reset success message

    if (data.password !== data.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      if (response.ok) {
        setSuccess("Account created successfully. Please sign in.");
        setData({
          email: "",
          password: "",
          confirm_password: "",
          role: "buyer",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again later.");
      console.error("Network error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="mb-2.5 block font-medium text-dark dark:text-white">
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
        <label htmlFor="password" className="mb-2.5 block font-medium text-dark dark:text-white">
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
        <label htmlFor="confirm_password" className="mb-2.5 block font-medium text-dark dark:text-white">
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
        <label htmlFor="role" className="mb-2.5 block font-medium text-dark dark:text-white">
          Role
        </label>
        <select
          name="role"
          value={data.role}
          onChange={handleChange}
          className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 text-red-500 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-500 font-medium">
          {success}
        </div>
      )}

      <div className="mb-4.5">
        <button type="submit" className="w-full rounded-lg bg-primary p-4 font-medium text-white hover:bg-opacity-90">
          Create an account
        </button>
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
