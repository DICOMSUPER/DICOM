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
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({
        url: basePath ? basePath + url : url,
        method,
        data,
        params,
      });

      const resData = result.data;

      const unwrapped =
        resData?.data?.data?.data ?? 
        resData?.data?.data ??       
        resData?.data ??          
        resData;                    

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
