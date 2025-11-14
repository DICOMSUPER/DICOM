"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../components/loginPage/LoginForm";
import { Header } from "../../components/loginPage/Header";
import { SecurityBadge } from "../../components/loginPage/SecurityBadge";
import { Background } from "../../components/loginPage/Background";
import { CheckCircle, Monitor, Users, FileText } from "lucide-react";
import { setCredentials } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("🔵 Attempting login with:", { email, password: "***" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      console.log("🔵 Response status:", res.status, res.statusText);

      if (!res.ok) {
        let errorMessage = `Login failed (${res.status})`;
        try {
          const err = await res.json();

          errorMessage = err.message || errorMessage;
        } catch (parseError) {
          errorMessage = `${errorMessage}: ${res.statusText}`;
        }
        toast.error(errorMessage);
      }

      const data = await res.json();

      // Lưu token
      const token = data.data.tokenResponse.accessToken;

      // Giải mã token để lấy user info và role
      const decoded: any = jwtDecode(token);
      console.log("🧩 Token payload:", decoded);

      const role = decoded.role;
      if (!role) {
        toast.error("Không tìm thấy role trong token");
      }

      // Dispatch credentials with user info
      dispatch(
        setCredentials({
          token,
          user: {
            id: decoded.userId || decoded.sub,
            email: decoded.email || email,
            role: role,
          },
        })
      );

      // Show success toast
      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        switch (role) {
          case "system_admin":
            router.push("/admin");
            break;
          case "imaging_technician":
            router.push("/imaging-technicians");
            break;
          case "reception_staff":
            router.push("/reception");
            break;
          case "physician":
            router.push("/physicians/dashboard");
            break;
          case "radiologist":
            router.push("/radiologist");
            break;
          default:
            router.push("/dashboard");
        }
      }, 1000);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      // Only show network error toast if it's a network/fetch error
      // Login errors already have their own toast messages
      if (error instanceof TypeError) {
        toast.error("Unable to connect to server");
      }
      // Re-throw the error so LoginForm can reset loading state
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
        <Background />
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
              {/* Quick Stats */}
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

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  View Studies
                </button>
                <button className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                  New Patient
                </button>
                <button className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors cursor-pointer">
                  Reports
                </button>
                <button className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700 transition-colors cursor-pointer">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Background />

      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <Header />
            <LoginForm onLogin={handleLogin} />
            <SecurityBadge />
          </div>
        </div>
      </div>

      {/* Right side - Medical themed illustration area */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-200 to-blue-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>

        {/* Medical equipment silhouettes */}
        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <Monitor size={80} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Advanced Medical Imaging
            </h2>
            <p className="text-xl opacity-90 max-w-md">
              Professional DICOM imaging system for healthcare providers
              worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-12 max-w-sm mx-auto">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <p className="text-sm">DICOM Compatible</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                <Monitor size={32} />
              </div>
              <p className="text-sm">HD Imaging</p>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white border-opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white border-opacity-20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border border-white border-opacity-20 rounded-full animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}
