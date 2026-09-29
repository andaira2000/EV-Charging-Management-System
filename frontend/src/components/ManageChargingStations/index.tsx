"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Server } from "@/server/requests";
import { getErrorMessage } from "@/server/errors";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";
import {
  Badge,
  LocationCell,
  TableCard,
  TableMessageRow,
  Td,
  Th,
} from "@/components/common/Table";
import {
  AVAILABILITY_OPTIONS,
  CONNECTOR_LABELS,
  SPEED_LABELS,
  STATION_STATES,
} from "@/lib/stations";
import { formatPounds } from "@/lib/format";

interface ChargingStationData {
  station_id: number;
  location: string;
  availability_status: string;
  charging_speed: string;
  power_capacity: number | string;
  price_per_kwh: number | string;
  connector_types: string;
}

// Defaults match the backend's model defaults.
const EMPTY_STATION: ChargingStationData = {
  station_id: 0,
  location: "",
  availability_status: "available",
  charging_speed: "slow",
  power_capacity: "",
  price_per_kwh: "",
  connector_types: "type2",
};

const inputClass =
  "w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary";
const labelClass = "mb-2 block text-sm font-medium text-dark dark:text-white";

const ManageStations: React.FC = () => {
  const [data, setData] = useState<ChargingStationData>(EMPTY_STATION);

  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<ChargingStationData[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [saving, setSaving] = useState(false);

  const token: string = Cookies.get("accessToken") ?? "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!data.location.trim()) {
      setError("Please enter the station's address.");
      return;
    }
    if (!(Number(data.power_capacity) > 0)) {
      setError("Power capacity must be greater than 0 kW.");
      return;
    }
    if (!(Number(data.price_per_kwh) > 0)) {
      setError("Price per kWh must be greater than £0.");
      return;
    }

    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    setSaving(true);

    try {
      let response;
      if (isEditMode) {
        const { station_id, ...changes } = data;
        response = await Server.updateChargingStation(
          token,
          station_id,
          changes,
        );
      } else {
        response = await Server.addChargingStation(token, data);
      }

      if (response.ok) {
        console.log(
          isEditMode
            ? "Charging station updated successfully"
            : "Charging station added successfully",
        );
        setOpen(false);
        fetchChargingStations();
        setIsEditMode(false);
        setData(EMPTY_STATION);
      } else {
        setError(
          await getErrorMessage(
            response,
            isEditMode
              ? "Failed to update charging station. Please try again."
              : "Failed to add charging station. Please try again.",
          ),
        );
      }
    } catch (error) {
      setError("Network error. Please try again later.");
      console.error("Network error:", error);
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (station: ChargingStationData) => {
    setError("");
    setIsEditMode(true);
    setOpen(true);
    setData(station);
  };

  const handleOpen = () => {
    setError("");
    setIsEditMode(false);
    setData(EMPTY_STATION);
    setOpen(true);
  };

  const handleClose = () => {
    setError("");
    setOpen(false);
  };

  const fetchChargingStations = async () => {
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    try {
      const response = await Server.getChargingStationsForUser(token);
      if (!response.ok) {
        throw new Error("Failed to fetch charging stations.");
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error("Error fetching charging stations:", error);
      setError("Error fetching charging stations.");
    } finally {
      setLoadingStations(false);
    }
  };
  useEffect(() => {
    fetchChargingStations();
  }, []);

  const handleDelete = async (stationId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this station?",
    );
    if (!confirmDelete) return;

    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    try {
      const response = await Server.deleteChargingStation(token, stationId);

      if (response.ok) {
        setStations((prevStations) =>
          prevStations.filter((station) => station.station_id !== stationId),
        );
      } else {
        setError(
          await getErrorMessage(
            response,
            "Failed to delete charging station. Please try again.",
          ),
        );
      }
    } catch (error) {
      setError("Network error. Please try again later.");
      console.error("Network error:", error);
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-dark-5 dark:text-dark-6">
          {stations.length > 0 &&
            `${stations.length} station${stations.length === 1 ? "" : "s"}`}
        </div>
        {!open && (
          <button
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 font-semibold text-white"
            onClick={handleOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add station
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-7xl rounded-lg bg-white p-6 shadow-md dark:bg-dark-2"
        >
          <div className="mb-5 text-lg font-bold text-dark dark:text-white">
            {isEditMode ? "Edit charging station" : "New charging station"}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="location" className={labelClass}>
                Address
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={data.location}
                onChange={handleChange}
                placeholder="e.g. King's Cross, Pancras Road, London N1C 4AB"
                className={inputClass}
              />
              <div className="mt-1.5 text-xs text-dark-5 dark:text-dark-6">
                The map position is looked up from this address. Start with a
                short name, then a comma.
              </div>
            </div>

            <div>
              <label htmlFor="availability_status" className={labelClass}>
                Status
              </label>
              <select
                id="availability_status"
                name="availability_status"
                value={data.availability_status}
                onChange={handleChange}
                className={inputClass}
              >
                {AVAILABILITY_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATION_STATES[status].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="charging_speed" className={labelClass}>
                Charging speed
              </label>
              <select
                id="charging_speed"
                name="charging_speed"
                value={data.charging_speed}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(SPEED_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="power_capacity" className={labelClass}>
                Power (kW)
              </label>
              <input
                id="power_capacity"
                type="number"
                name="power_capacity"
                value={data.power_capacity}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="price_per_kwh" className={labelClass}>
                Price per kWh (£)
              </label>
              <input
                id="price_per_kwh"
                type="number"
                name="price_per_kwh"
                value={data.price_per_kwh}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 0.55"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="connector_types" className={labelClass}>
                Connector
              </label>
              <select
                id="connector_types"
                name="connector_types"
                value={data.connector_types}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(CONNECTOR_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-5 font-medium text-red-500">{error}</div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving && <Spinner />}
              {saving
                ? "Saving…"
                : isEditMode
                  ? "Save changes"
                  : "Add station"}
            </button>
          </div>
          <SlowServerHint active={saving} />
        </form>
      )}

      {error && !open && (
        <div className="mx-auto w-full max-w-7xl font-medium text-red-500">
          {error}
        </div>
      )}

      <TableCard>
        <thead>
          <tr>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th>Speed</Th>
            <Th>Power</Th>
            <Th>Price</Th>
            <Th>Connector</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {stations.length > 0 ? (
            stations.map((station) => {
              const status =
                STATION_STATES[
                  station.availability_status as keyof typeof STATION_STATES
                ];

              return (
                <tr
                  key={station.station_id}
                  className="hover:bg-gray-1 dark:hover:bg-dark-3"
                >
                  <Td>
                    <LocationCell location={station.location} />
                  </Td>
                  <Td>
                    {status ? (
                      <Badge color={status.color}>{status.label}</Badge>
                    ) : (
                      station.availability_status
                    )}
                  </Td>
                  <Td>
                    {SPEED_LABELS[station.charging_speed] ??
                      station.charging_speed}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {Number(station.power_capacity)} kW
                  </Td>
                  <Td className="whitespace-nowrap">
                    {formatPounds(station.price_per_kwh)} / kWh
                  </Td>
                  <Td>
                    {CONNECTOR_LABELS[station.connector_types] ??
                      station.connector_types}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(station)}
                        className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(station.station_id)}
                        className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })
          ) : loadingStations ? (
            <TableMessageRow colSpan={7}>
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                Loading your stations…
              </div>
              <SlowServerHint active={loadingStations} />
            </TableMessageRow>
          ) : (
            <TableMessageRow colSpan={7}>
              <p className="font-medium text-dark dark:text-white">
                You haven&apos;t added any stations yet.
              </p>
              <p className="mt-1 text-sm">
                Use <strong>Add station</strong> above to list your
                first one.
              </p>
            </TableMessageRow>
          )}
        </tbody>
      </TableCard>
    </>
  );
};

export default ManageStations;
