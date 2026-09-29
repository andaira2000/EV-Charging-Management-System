"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FilterSidebar from "../Map/FilterSideBar";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useReservationUpdates from "@/hooks/useReservationUpdates";
import { fetchStations } from "@/utils";
import StationPopup from "../Map/StationPopup";
import Spinner from "@/components/common/Spinner";
import SlowServerHint from "@/components/common/SlowServerHint";
import MapLegend from "../Map/MapLegend";
import {
  STATION_ICONS,
  StationState,
  getStationState,
} from "../Map/stationStatus";

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

const checkAvailability = (
  stations: ChargingStationData[],
  setStationStates: (states: Record<number, StationState>) => void,
) => {
  const now = new Date();
  const updatedStates: Record<number, StationState> = {};
  stations.forEach((station) => {
    updatedStates[station.station_id] = getStationState(station, now);
  });
  setStationStates(updatedStates);
};

// Filter values from FilterSideBar mapped to station states.
const STATUS_FILTERS: Record<string, StationState> = {
  Available: "available",
  "In Use": "in_use",
  Maintenance: "maintenance",
  "Out of Order": "out_of_order",
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
    minPowerKw: 0,
    distance: 10,
    status: "All",
  });
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);

  const [stationStates, setStationStates] = useState<
    Record<number, StationState>
  >({});
  const [loading, setLoading] = useState(true);

  useReservationUpdates(setChargingStations);

  useEffect(() => {
    const { minPowerKw, status } = filters;

    const filteredStations = chargingStations.filter(
      (station: ChargingStationData) => {
        const isPowerValid = station.power_capacity >= minPowerKw;

        const isStatusValid =
          status === "All" ||
          stationStates[station.station_id] === STATUS_FILTERS[status];

        return isPowerValid && isStatusValid;
      },
    );

    setFilteredChargingStations(filteredStations);
  }, [filters, chargingStations, stationStates]);

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
    checkAvailability(chargingStations, setStationStates);

    const intervalId = setInterval(() => {
      checkAvailability(chargingStations, setStationStates);
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
    <>
      <FilterSidebar
        open={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
      {/* Fills the screen below the header: 89px header + the layout's
          vertical padding (p-4 / md:p-6 / 2xl:p-10). */}
      <div className="relative h-[calc(100dvh-121px)] min-h-[400px] overflow-hidden rounded-lg shadow-md md:h-[calc(100dvh-137px)] 2xl:h-[calc(100dvh-169px)]">
        <MapContainer
          center={currentLocation || [51.509865, -0.118092]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredChargingStations.map((station) => {
            const state =
              stationStates[station.station_id] ?? getStationState(station);

            return (
              <Marker
                key={station.station_id}
                position={[station.latitude, station.longitude]}
                icon={STATION_ICONS[state]}
              >
                <Popup>
                  <StationPopup
                    station={station}
                    state={state}
                    startTime={getStartTime()}
                    endTime={getEndTime()}
                  />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <MapLegend />
        <IconButton
          onClick={() => setSidebarOpen(true)}
          aria-label="Filter stations"
          className="!absolute right-3 top-3 z-[1000] !bg-white !shadow-md hover:!bg-gray-2"
        >
          <MenuIcon />
        </IconButton>
        {loading && (
          <div className="absolute inset-x-0 top-4 z-[1000] mx-auto flex w-fit flex-col items-center rounded-lg bg-white px-5 py-3 shadow-lg dark:bg-dark-2">
            <div className="flex items-center gap-2 font-medium text-dark dark:text-white">
              <Spinner />
              Loading charging stations…
            </div>
            <SlowServerHint active={loading} />
          </div>
        )}
      </div>
    </>
  );
}
