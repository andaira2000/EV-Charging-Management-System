// A headline number with its change against the previous period.
// "upIsGood" decides the delta colour; null means the change is neutral.
const StatTile = ({
  label,
  value,
  current,
  previous,
  upIsGood,
  periodLabel,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  upIsGood: boolean | null;
  periodLabel: string;
}) => {
  let delta: React.ReactNode;

  if (previous === 0) {
    delta = (
      <span className="text-dark-5 dark:text-dark-6">
        No data for the previous {periodLabel}
      </span>
    );
  } else {
    const change = (current - previous) / previous;
    const rounded = Math.round(change * 100);
    const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
    const good =
      direction === "flat" || upIsGood === null
        ? null
        : (direction === "up") === upIsGood;
    const colour =
      good === null
        ? "text-dark-5 dark:text-dark-6"
        : good
          ? "text-green-dark dark:text-green-light"
          : "text-red-dark dark:text-red-light";
    const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "•";

    delta = (
      <span>
        <span className={`font-semibold ${colour}`}>
          {arrow} {Math.abs(rounded)}%
        </span>{" "}
        <span className="text-dark-5 dark:text-dark-6">
          vs previous {periodLabel}
        </span>
      </span>
    );
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-md dark:bg-dark-2">
      <div className="text-sm font-medium text-dark-5 dark:text-dark-6">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-dark dark:text-white">
        {value}
      </div>
      <div className="mt-2 text-xs">{delta}</div>
    </div>
  );
};

export default StatTile;
