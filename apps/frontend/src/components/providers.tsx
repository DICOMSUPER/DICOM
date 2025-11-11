"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { loadTokenFromStorage } from "../store/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  // Load user data from cookies on app initialization
  useEffect(() => {
    store.dispatch(loadTokenFromStorage());
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-center" richColors />
    </Provider>
  );
}
