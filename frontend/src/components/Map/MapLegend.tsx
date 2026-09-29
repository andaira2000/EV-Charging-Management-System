import { STATION_STATES } from "@/lib/stations";

const MapLegend = () => (
  <div className="absolute bottom-6 left-3 z-[1000] rounded-lg bg-white px-3 py-2 text-sm shadow-lg dark:bg-dark-2">
    {Object.entries(STATION_STATES).map(([state, { label, color }]) => (
      <div key={state} className="flex items-center gap-2 py-0.5">
        <span
          className="inline-block h-3 w-3 rounded-full border border-white"
          style={{ backgroundColor: color }}
        />
        <span className="text-dark dark:text-white">{label}</span>
      </div>
    ))}
  </div>
);

export default MapLegend;
