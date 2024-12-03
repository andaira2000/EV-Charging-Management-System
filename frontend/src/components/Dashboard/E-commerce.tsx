"use client";  // This is necessary for using hooks like useState and useEffect in a Client Component

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define the type for the charging station data
interface ChargingStation {
  ID: number;
  AddressInfo: {
    Title: string;
    Latitude: number;
    Longitude: number;
  };
  Connections?: Array<{
    PowerKW?: number;
  }>;
}

export default function Dashboard() {
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);


  // Create a custom icon using images from the public folder
  const customIcon = new L.Icon({
    iconUrl: "/images/icon/marker-icon.png",  // Use URL from public folder
    shadowUrl: "/images/icon/marker-shadow.png",  // Use URL from public folder
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  async function fetchChargingStations() {
    // Your backend API endpoint running on localhost
    const apiUrl = 'http://127.0.0.1:8000/charging-stations/all';

    // JWT access token - assuming you already have the token stored (e.g., in localStorage)
    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMzMjY3MTkwLCJpYXQiOjE3MzMyNjM1OTAsImp0aSI6IjVhNDNiNDg3MmE3YzQ3NWNiNTFhMWUxM2IzMGIxNjE5Iiwic3ViIjoiMjBkYzM5NmMtNjAxMS03MDk1LTQ0YjUtOTRmYTRhZjdiMDgyIn0.h1jZDzcDrcSio7VvkkRDFrY7JEUxyN4dy0U4wb_jTj8";

    if (!accessToken) {
      console.error("Access token not found. Please log in.");
      return;
    }

    try {
      // Make the GET request to the API with Authorization header
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const chargingStationsFromBackend = await response.json();

      // Handle the response data (e.g., update the UI)
      console.log('Charging Stations:', chargingStationsFromBackend);
      // Here you can call a function to display the charging stations in your UI

      setChargingStations(chargingStationsFromBackend.map((station) => ( {
        ID: station.station_id,
        AddressInfo: {
          Title: station.location,
          Latitude: station.latitude,
          Longitude: station.longitude
        },
        Connections: [
          {
            PowerKW: station.power_capacity
          }
        ]
      })));
      

    } catch (error) {
      // Handle errors (e.g., token expiration, network issues)
      console.error('Failed to fetch charging stations:', error.message);
    }
  }

  useEffect(() => {
    fetchChargingStations()
  }, []);

  const handleReserve = (stationId: number) => {
    alert(`Reservation successful for Station ID: ${stationId}`);
  };

  return (
    <div style={{ height: "100vh" }}>
      <h1>EV Charging Station Locator</h1>
      <MapContainer center={[51.509865, -0.118092]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {chargingStations.map(
          (station) =>
            station.AddressInfo?.Latitude &&
            station.AddressInfo?.Longitude && (
              <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                icon={customIcon} // Use custom icon here
              >
                <Popup>
                  <strong>{station.AddressInfo.Title}</strong>
                  <br />
                  Power: {station.Connections?.[0]?.PowerKW || "N/A"} kW
                  <br />
                  <button
                    onClick={() => handleReserve(station.ID)}
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Reserve
                  </button>
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}
