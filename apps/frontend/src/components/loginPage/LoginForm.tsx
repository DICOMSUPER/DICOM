import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface LoginFormProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<void> | void;
}

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
});

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        await onLogin(values.email, values.password);
        // Keep loading state true on success - component will unmount on navigation
        // This prevents the button from flickering back to "Sign In" during page transition
      } catch (error) {
        // Only reset loading state on error so user can retry
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full max-w-md">
      <form onSubmit={formik.handleSubmit} className="space-y-5" autoComplete="on">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email
          </label>
          <div className="relative group">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 backdrop-blur-sm ${
                formik.touched.email && formik.errors.email 
                  ? "border-red-400 bg-red-50/50 focus:ring-red-500/50 focus:border-red-500" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="you@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-500 animate-in fade-in duration-200">{formik.errors.email}</p>
            )}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative group">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 backdrop-blur-sm ${
                formik.touched.password && formik.errors.password 
                  ? "border-red-400 bg-red-50/50 focus:ring-red-500/50 focus:border-red-500" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-0 -translate-y-1/2 pr-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-2 text-sm text-red-500 animate-in fade-in duration-200">{formik.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
