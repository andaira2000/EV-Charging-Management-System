"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import Cookies from "js-cookie";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: "",
    menuItems: [
      {
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="
      M12 2
      C8.69 2 6 4.69 6 8
      C6 12.53 12 20 12 20
      C12 20 18 12.53 18 8
      C18 4.69 15.31 2 12 2
      Z
      M12 10.5
      C10.62 10.5 9.5 9.38 9.5 8
      C9.5 6.62 10.62 5.5 12 5.5
      C13.38 5.5 14.5 6.62 14.5 8
      C14.5 9.38 13.38 10.5 12 10.5
      Z
    "
            />
          </svg>
        ),
        label: "Find Charging Stations",
        route: "/dashboard",
      },
      {
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="
    M19.14 12.94
    c.04-.31.06-.63.06-.94
    s-.02-.63-.06-.94
    l2.03-1.58
    c.19-.15.24-.41.12-.63
    l-1.92-3.32
    c-.12-.22-.38-.3-.62-.21
    l-2.39.96
    a7.14 7.14 0 0 0-1.7-.99
    l-.36-2.54
    A.5.5 0 0 0 14.4 2
    h-4.8
    a.5.5 0 0 0-.49.42
    l-.36 2.54
    c-.62.26-1.19.6-1.7.99
    l-2.39-.96
    c-.23-.09-.5 0-.62.21
    L2.71 8.85
    c-.12.22-.07.48.12.63
    l2.03 1.58
    c-.04.31-.06.63-.06.94
    s.02.63.06.94
    l-2.03 1.58
    c-.19.15-.24.41-.12.63
    l1.92 3.32
    c.12.22.38.3.62.21
    l2.39-.96
    c.51.38 1.08.72 1.7.99
    l.36 2.54
    c.03.24.24.42.49.42
    h4.8
    c.25 0 .46-.18.49-.42
    l.36-2.54
    c.62-.27 1.18-.61 1.7-.99
    l2.39.96
    c.24.09.5 0 .62-.21
    l1.92-3.32
    c.12-.22.07-.48-.12-.63
    l-2.03-1.58
    Z
    M12 15.5
    a3.5 3.5 0 1 1 0-7
    a3.5 3.5 0 0 1 0 7
    Z
  "
            />
          </svg>
        ),
        label: "Manage Charging Stations",
        route: "/manage-charging-stations",
      },
      {
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 4H18V2C18 1.45 17.55 1 17 1C16.45 1 16 1.45 16 2V4H8V2C8 1.45 7.55 1 7 1C6.45 1 6 1.45 6 2V4H5C3.34 4 2 5.34 2 7V19C2 20.66 3.34 22 5 22H19C20.66 22 22 20.66 22 19V7C22 5.34 20.66 4 19 4ZM20 19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V10H20V19Z" />

            <path d="M13 14H15L11 22V16H9L13 8V14Z" />
          </svg>
        ),
        label: "Reservations",
        route: "/reservations",
      },
      {
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 1C11.45 1 11 1.45 11 2V3.18C8.72 3.59 7 5.5 7 8C7 9.45 7.96 10.76 9.33 11.31L14.68 13.39C15.45 13.69 16 14.31 16 15C16 15.88 15.14 16.59 13.88 16.92C13.4 17.05 12.85 17.11 12.31 17.11C10.56 17.11 9.08 16.65 8.07 15.96C7.7 15.71 7.2 15.79 6.95 16.15C6.7 16.52 6.79 17.03 7.16 17.28C8.43 18.16 10.09 18.73 12 18.88V20C12 20.55 12.45 21 13 21C13.55 21 14 20.55 14 20V18.82C16.28 18.41 18 16.5 18 14C18 12.55 17.04 11.24 15.67 10.69L10.32 8.61C9.55 8.31 9 7.69 9 7C9 6.12 9.86 5.41 11.12 5.08C11.6 4.95 12.15 4.89 12.69 4.89C14.44 4.89 15.92 5.35 16.93 6.04C17.3 6.29 17.8 6.21 18.05 5.85C18.3 5.48 18.21 4.97 17.84 4.72C16.57 3.84 14.91 3.27 13 3.12V2C13 1.45 12.55 1 12 1Z" />
          </svg>
        ),
        label: "Payments",
        route: "/payments",
      },
      {
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 3C2.45 3 2 3.45 2 4V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V4C22 3.45 21.55 3 21 3H3ZM11 11H13V18H11V11ZM7 8H9V18H7V8ZM15 13H17V18H15V13Z" />
          </svg>
        ),
        label: "Analytics",
        route: "/analytics",
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();

  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRoleAuthenticated] = useState(false);

  useEffect(() => {
    if (Cookies.get("accessToken") !== undefined) {
      setIsAuthenticated(true);
    }

    const role = localStorage.getItem("role");
    console.log("Role:", role);
    if (role == "seller") {
      setUserRoleAuthenticated(true);
    }
  }, []);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      {isAuthenticated && (
        <aside
          className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0 duration-300 ease-linear"
              : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
            <Link href="/">
              <Logo size={40} />
            </Link>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="block lg:hidden"
            >
              <svg
                className="fill-current"
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                  fill=""
                />
              </svg>
            </button>
          </div>

          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav className="mt-1 px-4 lg:px-6">
              {menuGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                    {group.name}
                  </h3>
                  <ul className="mb-6 flex flex-col gap-2">
                    {group.menuItems
                      .filter(
                        (menuItem, menuIndex) =>
                          !(menuIndex === 1 && !userRole),
                      )
                      .map((menuItem, menuIndex) => (
                        <SidebarItem
                          key={menuIndex}
                          item={menuItem}
                          pageName={pageName}
                          setPageName={setPageName}
                        />
                      ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </ClickOutside>
  );
};

export default Sidebar;
