import ReserveButton from "./ReserveButton";
import NotifyButton from "./NotifyButton";
import { STATION_STATES, StationState } from "./stationStatus";

interface StationPopupProps {
  station: {
    station_id: number;
    location: string;
    charging_speed: string;
    power_capacity: number | string;
    price_per_kwh: number | string;
    connector_types: string;
  };
  state: StationState;
  startTime: string;
  endTime: string;
}

const CONNECTOR_LABELS: Record<string, string> = {
  type1: "Type 1",
  type2: "Type 2",
  ccs: "CCS",
  chademo: "CHAdeMO",
};

const SPEED_LABELS: Record<string, string> = {
  fast: "Fast",
  slow: "Slow",
};

const formatPounds = (amount: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    amount,
  );

// Leaflet styles <p> and <h*> inside popups, so this uses divs throughout.
const StationPopup = ({
  station,
  state,
  startTime,
  endTime,
}: StationPopupProps) => {
  const { label, color } = STATION_STATES[state];
  const [name, ...addressParts] = station.location.split(",");
  const address = addressParts.join(",").trim();

  const power = Number(station.power_capacity);
  const price = Number(station.price_per_kwh);
  const hours =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000;
  // Same formula the backend uses for the Stripe checkout amount.
  const estimatedCost = power * hours * price;

  const details = [
    ["Power", `${power} kW`],
    ["Speed", SPEED_LABELS[station.charging_speed] ?? station.charging_speed],
    [
      "Connector",
      CONNECTOR_LABELS[station.connector_types] ?? station.connector_types,
    ],
    ["Price", `${formatPounds(price)} / kWh`],
  ];

  return (
    <div className="w-56 font-satoshi text-dark">
      <div className="text-base font-bold leading-tight">{name}</div>
      {address && (
        <div className="mt-0.5 text-xs text-dark-5">{address}</div>
      )}

      <div
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </div>

      <div className="my-3 border-t border-stroke" />

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {details.map(([term, value]) => (
          <div key={term} className="contents">
            <div className="text-dark-5">{term}</div>
            <div className="font-medium">{value}</div>
          </div>
        ))}
      </div>

      <div className="my-3 border-t border-stroke" />

      {state === "available" && (
        <>
          <div className="text-sm">
            {Math.round(hours * 60)} min from now ≈{" "}
            <span className="font-semibold">{formatPounds(estimatedCost)}</span>
          </div>
          <ReserveButton
            chargingStationId={station.station_id}
            startTime={startTime}
            endTime={endTime}
          />
        </>
      )}

      {state === "in_use" && (
        <>
          <div className="text-sm">
            Someone is charging here right now. Get an email when it frees up.
          </div>
          <NotifyButton chargingStationId={station.station_id} />
        </>
      )}

      {(state === "maintenance" || state === "out_of_order") && (
        <div className="text-sm">
          This station is temporarily unavailable. Please choose another one.
        </div>
      )}
    </div>
  );
};

export default StationPopup;
