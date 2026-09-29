import React from "react";
import Spinner from "./Spinner";

// Full-width tabs with a soft highlight on the active one, separated by
// thin bars on wider screens. Used on the Reservations and Analytics pages.
function Tabs<T extends string | number>({
  tabs,
  active,
  onChange,
  busy = false,
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  busy?: boolean; // shows a small spinner in the active tab while loading
}) {
  return (
    <ul className="mx-auto flex w-full max-w-7xl items-center justify-center gap-4">
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.value}>
          <li className="flex-1 text-center">
            <button
              type="button"
              onClick={() => onChange(tab.value)}
              aria-pressed={active === tab.value}
              className={`group relative flex w-full items-center justify-center gap-2 rounded-[7px] px-3.5 py-3 font-medium duration-300 ease-in-out ${
                active === tab.value
                  ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                  : "text-dark-4 hover:bg-gray-100 hover:shadow-md dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {busy && active === tab.value && <Spinner className="h-4 w-4" />}
              {tab.label}
            </button>
          </li>
          {index < tabs.length - 1 && (
            <li className="hidden text-gray-400 dark:text-gray-600 md:block">
              |
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
}

export default Tabs;
