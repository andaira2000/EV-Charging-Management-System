// A small tooltip positioned inside a relative chart container.
// The value leads (strong), the label follows (secondary).
const ChartTooltip = ({
  x,
  y,
  value,
  label,
  containerWidth,
}: {
  x: number;
  y: number;
  value: string;
  label: string;
  containerWidth: number;
}) => {
  // Keep the tooltip inside the chart: flip to the left near the right edge.
  const flip = x > containerWidth - 170;
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-stroke bg-white px-3 py-2 shadow-lg dark:border-dark-3 dark:bg-dark"
      style={{
        left: flip ? undefined : x + 12,
        right: flip ? containerWidth - x + 12 : undefined,
        top: Math.max(y - 20, 0),
      }}
    >
      <div className="text-sm font-semibold text-dark dark:text-white">
        {value}
      </div>
      <div className="text-xs text-dark-5 dark:text-dark-6">{label}</div>
    </div>
  );
};

export default ChartTooltip;
