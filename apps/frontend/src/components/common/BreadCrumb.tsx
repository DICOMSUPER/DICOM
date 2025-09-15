import { BreadcrumbItem } from "@/types/BreadcrumbItem.type";
import React from "react";

export default function SmallBreadCrumb({ list }: { list: BreadcrumbItem[] }) {
  if (!list || list.length === 0) return <></>;
  return (
    <nav
      className="justify-between px-2 py-1 text-gray-700 border border-gray-200 rounded-lg sm:flex sm:px-5 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 mx-1 my-1"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center mb-3 space-x-1 md:space-x-2 rtl:space-x-reverse sm:mb-0">
        {list.map((listItem, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <a
                href={listItem.href}
                className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
              >
                {listItem.label}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
