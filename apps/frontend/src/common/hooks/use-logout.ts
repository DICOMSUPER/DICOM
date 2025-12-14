"use client";

import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

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
      // Get token from Redux state or cookies as fallback
      const accessToken = token || Cookies.get("accessToken");
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers,
      });
      dispatch(logoutAction());
      dispatch(notificationApi.util.resetApiState());
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to call logout endpoint", error);
      setIsLoggingOut(false);
      toast.error("Failed to logout. Please try again.");
    }
  }, [dispatch, router, isLoggingOut, token]);

  return { logout, isLoggingOut };
}

