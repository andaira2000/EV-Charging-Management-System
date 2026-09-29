const IS_LOCAL = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const SERVER_URL = IS_LOCAL
  ? process.env.NEXT_PUBLIC_LOCAL_SERVER_URL
  : process.env.NEXT_PUBLIC_DEPLOYED_SERVER_URL;
const SERVER_URL_SOCKET = IS_LOCAL
  ? process.env.NEXT_PUBLIC_LOCAL_SERVER_URL_SOCKET
  : process.env.NEXT_PUBLIC_DEPLOYED_SERVER_URL_SOCKET;

console.log("SERVER_URL", SERVER_URL);

async function validateToken(token: string) {
  try {
    const response = await fetch(`${SERVER_URL}/validate-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response", response);

    return response.ok;
  } catch (error) {
    console.error("Network error:", error);
    return false;
  }
}

async function login({ email, password }: { email: string; password: string }) {
  return fetch(`${SERVER_URL}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

async function signup({
  email,
  first_name,
  last_name,
  password,
  role,
}: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: string;
}) {
  return fetch(`${SERVER_URL}/signup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name,
      last_name,
      password,
      role,
    }),
  });
}

async function getAllChargingStations(token: string) {
  return fetch(`${SERVER_URL}/charging-stations/all/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function getChargingStationsForUser(token: string) {
  return fetch(`${SERVER_URL}/charging-stations/user/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function addChargingStation(token: string, data: any) {
  return fetch(`${SERVER_URL}/charging-stations/add/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

async function deleteChargingStation(token: string, stationId: number) {
  return fetch(`${SERVER_URL}/charging-stations/${stationId}/delete/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function createCheckoutSession(
  token: string,
  chargingStationId: number,
  startTime: string,
  endTime: string,
) {
  return fetch(`${SERVER_URL}/create-checkout-session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      charging_station_id: chargingStationId,
      start_time: startTime,
      end_time: endTime,
    }),
  });
}

async function getMostVisitedStation(token: string) {
  return fetch(`${SERVER_URL}/reservations/most-visited/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function getAllReservations(token: string) {
  return fetch(`${SERVER_URL}/get-all-reservations/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function getUserReservations(token: string) {
  return fetch(`${SERVER_URL}/get-user-reservations/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function updateChargingStation(
  token: string,
  stationId: number,
  data: object,
) {
  return fetch(`${SERVER_URL}/charging-stations/${stationId}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

async function cancelReservation(token: string, reservationId: string) {
  return fetch(`${SERVER_URL}/reservations/${reservationId}/cancel/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function requestNotification(token: string, chargingStationId: number) {
  return fetch(`${SERVER_URL}/notifications/request/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      charging_station_id: chargingStationId,
    }),
  });
}

async function getUserPayments(token: string) {
  return fetch(`${SERVER_URL}/payments/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

const Server = {
  validateToken,
  login,
  signup,
  getAllChargingStations,
  getChargingStationsForUser,
  addChargingStation,
  deleteChargingStation,
  createCheckoutSession,
  getMostVisitedStation,
  updateChargingStation,
  getAllReservations,
  getUserReservations,
  cancelReservation,
  requestNotification,
  getUserPayments,
  SERVER_URL,
  SERVER_URL_SOCKET,
};

export { Server };
