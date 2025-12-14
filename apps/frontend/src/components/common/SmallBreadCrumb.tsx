import { BreadcrumbItem } from "@/common/types/BreadcrumbItem.type";
import { Link } from "lucide-react";
import React from "react";

export default function SmallBreadCrumb({ list }: { list: BreadcrumbItem[] }) {
  if (!list || list.length === 0) return <></>;
  return (
    <nav
      className="justify-between px-2 py-1 text-[var(--foreground)] border border-[var(--border)] rounded-lg sm:flex sm:px-5 bg-[var(--surface)] mx-1 my-1"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center mb-3 space-x-1 md:space-x-2 rtl:space-x-reverse sm:mb-0">
        {list.map((listItem, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 mx-1 text-[var(--neutral)]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              {listItem.href ? (
                <Link
                  href={listItem.href}
                  className="ms-1 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--background)] hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 ease-in-out md:ms-2"
                >
                  {listItem.label}
                </Link>
              ) : (
                <span
                  onClick={listItem?.customOnclick}
                  className="ms-1 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--background)] hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 ease-in-out cursor-pointer md:ms-2"
                >
                  {listItem.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
