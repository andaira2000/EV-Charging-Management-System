import { splitLocation } from "@/lib/stations";

// Shared building blocks so every table in the app looks the same.

export const TableCard = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl overflow-x-auto rounded-lg bg-white shadow-md dark:bg-dark-2">
    <table className="min-w-full table-auto text-left">{children}</table>
  </div>
);

export const Th = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <th
    className={`whitespace-nowrap bg-gray-1 px-6 py-3.5 text-sm font-semibold text-dark-5 dark:bg-dark-3 dark:text-dark-6 ${className}`}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <td
    className={`border-t border-stroke px-6 py-4 text-sm text-dark dark:border-dark-3 dark:text-white ${className}`}
  >
    {children}
  </td>
);

// A full-width row for loading and empty states.
export const TableMessageRow = ({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="border-t border-stroke px-6 py-10 text-center text-dark-5 dark:border-dark-3 dark:text-dark-6"
    >
      {children}
    </td>
  </tr>
);

// "King's Cross" in bold with the rest of the address underneath.
export const LocationCell = ({ location }: { location: string }) => {
  const { name, address } = splitLocation(location);
  return (
    <div className="min-w-[180px]">
      <div className="font-medium">{name}</div>
      {address && <div className="text-xs text-dark-5">{address}</div>}
    </div>
  );
};

// A coloured pill, e.g. for station status or payment state.
export const Badge = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => (
  <span
    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold"
    style={{ backgroundColor: `${color}1A`, color }}
  >
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
    {children}
  </span>
);
