"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/loginPage/LoginForm";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { Monitor, CheckCircle, Users, FileText } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message || `Login failed (${res.status})`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Save token
      const token = data.data.tokenResponse.accessToken;

      // Decode token to get user info and role
      const decoded: any = jwtDecode(token);

      const role = decoded.role;
      if (!role) {
        toast.error("Role not found in token");
      }

      dispatch(
        setCredentials({
          token,
          user: {
            id: decoded.userId || decoded.sub,
            email: decoded.email || email,
            role: role,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
          },
        })
      );

      // Show success toast
      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        switch (role) {
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
      }, 1000);
      setIsLoggedIn(true);
    } catch (error) {
      if (error instanceof TypeError) {
        toast.error("Unable to connect to server");
      }
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Monitor size={24} className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    DICOM System
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dashboard
              </h2>
              <p className="text-gray-600">
                Medical imaging and diagnostic tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Studies</p>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Online Users</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">System Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      Operational
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url(https://img.freepik.com/premium-photo/stethoscope-eounceass-grouping-digital-background_961875-396154.jpg?semt=ais_hybrid&w=740&q=80)",
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
