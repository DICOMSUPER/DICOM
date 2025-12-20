"use client";

import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout as logoutAction } from "@/store/authSlice";
import { notificationApi } from "@/store/notificationApi";
import { RootState } from "@/store";

export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Get token from Redux state or localStorage as fallback
      // Note: The httpOnly accessToken cookie is handled by the backend
      const accessToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Call backend logout to clear the httpOnly cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
        method: "POST",
        credentials: "include", // Important: sends httpOnly cookie to backend
        headers,
      });
      
      // Clear local state (localStorage cleared in logoutAction)
      dispatch(logoutAction());
      dispatch(notificationApi.util.resetApiState());
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to call logout endpoint", error);
      // Even if backend logout fails, clear local state
      dispatch(logoutAction());
      dispatch(notificationApi.util.resetApiState());
      setIsLoggingOut(false);
      toast.error("Failed to logout. Please try again.");
      router.push("/login");
    }
  }, [dispatch, router, isLoggingOut, token]);

  return { logout, isLoggingOut };
}

