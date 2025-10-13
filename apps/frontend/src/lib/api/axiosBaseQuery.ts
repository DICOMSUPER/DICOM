import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    const url = typeof args === 'string' ? args : args.url;
    const method = typeof args === 'string' ? 'GET' : (args.method || 'GET');
    const body = typeof args === 'string' ? undefined : args.body;
    const params = typeof args === 'string' ? undefined : args.params;

    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      method,
      data: body,
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return { data: response.data };
  } catch (error: any) {
    return {
      error: {
        status: error.response?.status || 500,
        data: error.response?.data || error.message,
      },
    };
  }
};
