"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      // Error is handled by parent, just let finally reset loading
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-blue-950/30 border border-blue-500/20 rounded-2xl p-8 shadow-2xl w-full max-w-md">
      <div className="mb-8 text-center pb-6 border-b border-blue-400/20">
        <h2 className="text-2xl font-bold text-white mb-2">
          DICOM Imaging System
        </h2>
        <p className="text-blue-200/60 text-sm">
          Professional medical imaging and diagnostic tools
        </p>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-blue-200/60 text-sm">
          Access your medical imaging workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
            <User size={20} />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 h-12 bg-blue-900/20 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:bg-blue-900/30 rounded-full"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
            <Lock size={20} />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 bg-blue-900/20 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:bg-blue-900/30 rounded-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-blue-400/50 bg-blue-900/20"
            />
            <span className="text-sm text-blue-100">Remember me</span>
          </label>
          <a
            href="#"
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            Forgot password?
          </a>
        </div> */}

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-blue-400/20 text-center">
        <p className="text-blue-200/60 text-sm">
          System Status: <span className="text-green-400">Online</span>
        </p>
        {/* <p className="text-blue-200/40 text-xs mt-1">v2.4.1</p> */}
      </div>
    </div>
  );
}
