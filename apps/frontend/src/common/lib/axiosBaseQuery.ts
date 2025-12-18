import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axios";

export const axiosBaseQuery =
  (
    basePath: string
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      responseType?: AxiosRequestConfig["responseType"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers, responseType }) => {
    try {
      const result = await axiosInstance({
        url: basePath ? basePath + url : url,
        method,
        data,
        params,
        headers,
        responseType,
      });

      const resData = result.data;

      // If responseType is blob, return directly without logging
      if (responseType === 'blob') {
        return { data: resData };
      }

      // Debug API response structure
      console.log("API Response Debug:", {
        url: basePath + url,
        fullResponse: resData,
        dataField: resData?.data,
        nestedData: resData?.data?.data,
        hasTotalInRoot: "total" in (resData || {}),
        hasTotalInData: "total" in (resData?.data || {}),
      });

      // Check if response has wrapper structure: { success: true, data: { data: [], total: ... } }
      if (
        resData?.data &&
        typeof resData.data === "object" &&
        ("total" in resData.data || "page" in resData.data)
      ) {
        console.log("Returning nested paginated response:", resData.data);
        return { data: resData.data };
      }

      // Check if response is direct paginated: { data: [], total: number, page: number }
      if (
        resData &&
        typeof resData === "object" &&
        ("total" in resData || "page" in resData)
      ) {
        console.log("Returning direct paginated response:", resData);
        return { data: resData };
      }

      // Otherwise, try to unwrap nested data

      // return { data: resData };

      return { data: resData };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
        },
      };
    }
  };
