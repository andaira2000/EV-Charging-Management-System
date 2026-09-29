"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FilterSidebar from "../Map/FilterSideBar";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ReserveButton from "../Map/ReserveButton";
import useReservationUpdates from "@/hooks/useReservationUpdates";
import { fetchStations } from "@/utils";
import NotifyButton from "../Map/NotifyButton";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";

interface ChargingStationData {
  station_id: number;
  location: string;
  latitude: number;
  longitude: number;
  availability_status: string;
  reservations: any[];
  charging_speed: string;
  power_capacity: number;
  price_per_kwh: number;
  connector_types: string;
}

const customIcon = new L.Icon({
  iconUrl: "/images/icon/marker-icon.png",
  shadowUrl: "/images/icon/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const isStationAvailableNow = (station: ChargingStationData) => {
  const now = new Date();
  const hasActiveReservation = station.reservations.some(
    (reservation) =>
      new Date(reservation.start_time) <= now &&
      new Date(reservation.end_time) >= now,
  );
  return station.availability_status === "available" && !hasActiveReservation;
};

const checkAvailability = (stations: any, setAvailability: Function) => {
  const updatedAvailability: Record<number, boolean> = {};
  stations.forEach((station: any) => {
    updatedAvailability[station.station_id] = isStationAvailableNow(station);
  });
  console.log("Updated availability: ", updatedAvailability);
  setAvailability(updatedAvailability);
};

export default function Dashboard() {
  const [chargingStations, setChargingStations] = useState<
    ChargingStationData[]
  >([]);
  const [filteredChargingStations, setFilteredChargingStations] = useState<
    ChargingStationData[]
  >([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPowerKw: 50,
    distance: 10,
    status: "All",
  });
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);

  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useReservationUpdates(setChargingStations);

  useEffect(() => {
    const { minPowerKw, status } = filters;

    const filteredStations = chargingStations.filter(
      (station: ChargingStationData) => {
        const isPowerValid = station.power_capacity >= minPowerKw;

        const isStatusValid =
          status === "All" ||
          (status === "Available" && availability[station.station_id]) ||
          (status === "In Use" && !availability[station.station_id]);

        return isPowerValid && isStatusValid;
      },
    );

    setFilteredChargingStations(filteredStations);
  }, [filters, chargingStations]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location: ", error);
        },
      );
    }
  }, []);

  useEffect(() => {
    fetchStations()
      .then((stations) => {
        setChargingStations(stations);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stations:", error);
        window.location.href = "/auth/signin";
      });
  }, []);

  useEffect(() => {
    checkAvailability(chargingStations, setAvailability);

    const intervalId = setInterval(() => {
      checkAvailability(chargingStations, setAvailability);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [chargingStations]);

  const getStartTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes());
    return date.toISOString().replace("Z", "+00:00");
  };

  const getEndTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 90);

    return date.toISOString().replace("Z", "+00:00");
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <IconButton onClick={() => setSidebarOpen(true)}>
        <MenuIcon />
      </IconButton>
      <FilterSidebar
        open={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
      <MapContainer
        center={currentLocation || [51.509865, -0.118092]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredChargingStations.map((station) => (
          <Marker
            key={station.station_id}
            position={[station.latitude, station.longitude]}
            icon={customIcon}
          >
            <Popup>
              <strong>{station.location}</strong>
              <br />
              <strong>Power:</strong> {station.power_capacity} kW
              <br />
              <strong>Status: </strong>
              <span
                style={{
                  color: availability[station.station_id] ? "green" : "red",
                }}
              >
                {availability[station.station_id] ? "Available" : "In Use"}
              </span>
              <br />
              {availability[station.station_id] ? (
                <ReserveButton
                  chargingStationId={station.station_id}
                  startTime={getStartTime()}
                  endTime={getEndTime()}
                />
              ) : (
                <NotifyButton chargingStationId={station.station_id} />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {loading && (
        <div className="absolute inset-x-0 top-12 z-[1000] mx-auto flex w-fit flex-col items-center rounded-lg bg-white px-5 py-3 shadow-lg dark:bg-dark-2">
          <div className="flex items-center gap-2 font-medium text-dark dark:text-white">
            <Spinner />
            Loading charging stations…
          </div>
          <SlowServerHint active={loading} />
        </div>
      )}
    </div>
  );
}
