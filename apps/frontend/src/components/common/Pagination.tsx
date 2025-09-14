import React from "react";

export default function Pagination({
  page,
  size,
  maxPage,
  theme = "light",
  onPageChange,
}: {
  page: number;
  size: number;
  maxPage: number;
  theme?: "light" | "dark";
  onPageChange?: (newPage: number) => void;
}) {
  const handlePageClick = (newPage: number) => {
    if (newPage >= 1 && newPage <= maxPage && newPage !== page) {
      onPageChange?.(newPage);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(maxPage, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const baseButtonClass =
    theme === "light"
      ? "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
      : "flex items-center justify-center px-3 h-8 leading-tight text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white";

  const activeButtonClass =
    theme === "light"
      ? "z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
      : "z-10 flex items-center justify-center px-3 h-8 leading-tight text-white border border-gray-700 bg-gray-700 hover:bg-gray-600";

  const disabledButtonClass =
    theme === "light"
      ? "flex items-center justify-center px-3 h-8 leading-tight text-gray-300 bg-gray-100 border border-gray-300 cursor-not-allowed"
      : "flex items-center justify-center px-3 h-8 leading-tight text-gray-600 bg-gray-900 border border-gray-700 cursor-not-allowed";

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <nav aria-label="Pagination navigation">
        <ul className="flex items-center -space-x-px h-8 text-sm">
          {/* Previous button */}
          <li>
            <button
              onClick={() => handlePageClick(page - 1)}
              disabled={page === 1}
              className={`${
                page === 1 ? disabledButtonClass : baseButtonClass
              } border-e-0 rounded-s-lg`}
              aria-label="Go to previous page"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
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
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </button>
          </li>

          {/* First page if not in range */}
          {page > 3 && (
            <>
              <li>
                <button
                  onClick={() => handlePageClick(1)}
                  className={baseButtonClass}
                  aria-label="Go to page 1"
                >
                  1
                </button>
              </li>
              {page > 4 && (
                <li>
                  <span className={`${baseButtonClass} cursor-default`}>
                    ...
                  </span>
                </li>
              )}
            </>
          )}

          {/* Page numbers */}
          {generatePageNumbers().map((pageNum) => (
            <li key={pageNum}>
              <button
                onClick={() => handlePageClick(pageNum)}
                className={
                  pageNum === page ? activeButtonClass : baseButtonClass
                }
                aria-current={pageNum === page ? "page" : undefined}
                aria-label={`Go to page ${pageNum}`}
              >
                {pageNum}
              </button>
            </li>
          ))}

          {/* Last page if not in range */}
          {page < maxPage - 2 && (
            <>
              {page < maxPage - 3 && (
                <li>
                  <span className={`${baseButtonClass} cursor-default`}>
                    ...
                  </span>
                </li>
              )}
              <li>
                <button
                  onClick={() => handlePageClick(maxPage)}
                  className={baseButtonClass}
                  aria-label={`Go to page ${maxPage}`}
                >
                  {maxPage}
                </button>
              </li>
            </>
          )}

          {/* Next button */}
          <li>
            <button
              onClick={() => handlePageClick(page + 1)}
              disabled={page === maxPage}
              className={`${
                page === maxPage ? disabledButtonClass : baseButtonClass
              } rounded-e-lg`}
              aria-label="Go to next page"
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
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
            </button>
          </li>
        </ul>
      </nav>

      {/* Demo controls */}
      <div className="ml-8 space-x-2">
        <span className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
          Page {page} of {maxPage}
        </span>
      </div>
    </div>
  );
}
