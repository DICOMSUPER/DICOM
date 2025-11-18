"use client";

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout as logoutAction } from "@/store/authSlice";

export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to call logout endpoint", error);
    } finally {
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      router.push("/login");
      setIsLoggingOut(false);
    }
  }, [dispatch, router, isLoggingOut]);

  return { logout, isLoggingOut };
}

