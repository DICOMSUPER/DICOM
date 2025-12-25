"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/loginPage/LoginForm";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { useLazyGetCurrentProfileQuery } from "@/store/userApi";
import { check } from "zod";

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [getProfile] = useLazyGetCurrentProfileQuery();

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // ✅ Lấy profile bằng cookie
      const profileResult = await getProfile().unwrap();
      const user = profileResult.data;
      console.log("check ", user);

      if (!user?.role) {
        toast.error("Role not found");
        return;
      }

      console.log(data);

      // ✅ Lưu redux (UI state)
      dispatch(
        setCredentials({
          user: { ...user, role: user.role },
          token: data?.data?.tokenResponse?.accessToken,
        })
      );

      toast.success("Login successful!");

      // ✅ Redirect theo role
      switch (user.role) {
        case "system_admin":
          router.push("/admin/dashboard");
          break;
        case "imaging_technician":
          router.push("/imaging-technician/dashboard");
          break;
        case "reception_staff":
          router.push("/reception/dashboard");
          break;
        case "physician":
          router.push("/physician/dashboard");
          break;
        case "radiologist":
          router.push("/radiologist/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Unable to login");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url(https://img.freepik.com/premium-photo/stethoscope-eounceass-grouping-digital-background_961875-396154.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full px-6 flex justify-center">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}
