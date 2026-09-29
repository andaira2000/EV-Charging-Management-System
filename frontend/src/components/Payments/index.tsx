"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";
import {
  LocationCell,
  TableCard,
  TableMessageRow,
  Td,
  Th,
} from "@/components/common/Table";
import { formatDateTime, formatPounds, formatTimeRange } from "@/lib/format";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const token = Cookies.get("accessToken") ?? "";
      try {
        const response = await Server.getUserPayments(token);
        if (!response.ok) {
          setError(
            await getErrorMessage(response, "Could not load your payments."),
          );
          return;
        }
        setPayments(await response.json());
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Newest first.
  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
  );
  const totalSpent = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  // The first 8 characters of the UUID are enough to tell payments apart.
  const shortReference = (id: string) => id.slice(0, 8).toUpperCase();

  const generateInvoice = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Payment Invoice", 14, 20);

    // Table data. Start and end stay separate columns because the PDF's
    // built-in font can't be relied on for the en dash in time ranges.
    const tableColumn = [
      "Reference",
      "Paid on",
      "Location",
      "Start",
      "End",
      "Amount",
    ];
    const tableRows = sortedPayments.map((payment) => [
      shortReference(payment.id),
      formatDateTime(payment.payment_date),
      payment.location,
      formatDateTime(payment.start_time),
      formatDateTime(payment.end_time),
      formatPounds(payment.amount),
    ]);
    tableRows.push(["", "", "", "", "Total", formatPounds(totalSpent)]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    // Save PDF
    doc.save("invoice.pdf");
  };

  return (
    <div className="w-full p-6">
      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Payment History
          </h2>
          {payments.length > 0 && (
            <div className="mt-1 text-sm text-dark-5 dark:text-dark-6">
              {payments.length} payment{payments.length === 1 ? "" : "s"} ·{" "}
              {formatPounds(totalSpent)} in total
            </div>
          )}
        </div>

        <button
          onClick={generateInvoice}
          disabled={payments.length === 0}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download invoice (PDF)
        </button>
      </div>

      {error && (
        <p className="mx-auto mb-4 max-w-7xl font-medium text-red-500">
          {error}
        </p>
      )}

      {/* Table */}
      <TableCard>
        <thead>
          <tr>
            <Th>Paid on</Th>
            <Th>Location</Th>
            <Th>Charging slot</Th>
            <Th>Reference</Th>
            <Th className="text-right">Amount</Th>
          </tr>
        </thead>
        <tbody>
          {sortedPayments.length > 0 ? (
            sortedPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-1 dark:hover:bg-dark-3">
                <Td className="whitespace-nowrap">
                  {formatDateTime(payment.payment_date)}
                </Td>
                <Td>
                  <LocationCell location={payment.location} />
                </Td>
                <Td className="whitespace-nowrap">
                  {formatTimeRange(payment.start_time, payment.end_time)}
                </Td>
                <Td>
                  <span
                    title={payment.id}
                    className="font-mono text-xs text-dark-5 dark:text-dark-6"
                  >
                    {shortReference(payment.id)}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-right font-semibold">
                  {formatPounds(payment.amount)}
                </Td>
              </tr>
            ))
          ) : (
            <TableMessageRow colSpan={5}>
              {loading ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    Loading your payments…
                  </div>
                  <SlowServerHint active={loading} />
                </>
              ) : (
                <>
                  <p className="font-medium text-dark dark:text-white">
                    No payments yet.
                  </p>
                  <p className="mt-1 text-sm">
                    Payments appear here after you{" "}
                    <Link href="/dashboard" className="text-primary">
                      reserve and pay for a charging slot
                    </Link>
                    .
                  </p>
                </>
              )}
            </TableMessageRow>
          )}
        </tbody>
      </TableCard>
    </div>
  );
};

export default Payments;
