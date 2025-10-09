"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBackendApiUrl } from "@/utils/backendApiUrl";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const backendApiUrl = getBackendApiUrl();

  const persistSession = (token: string, expiresAt: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authTokenExpiresAt", expiresAt);

    const expiresAtDate = new Date(expiresAt);
    const maxAgeSeconds = Math.max(
      0,
      Math.floor((expiresAtDate.getTime() - Date.now()) / 1000)
    );
    document.cookie = `authToken=${token}; path=/; max-age=${maxAgeSeconds}`;
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/");
  };

  const handleError = async (response: Response) => {
    try {
      const data = await response.json();
      setErrorMessage(data.message || "Anmeldung fehlgeschlagen.");
    } catch {
      setErrorMessage("Anmeldung fehlgeschlagen.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${backendApiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        await handleError(response);
        return;
      }

      const data = await response.json();
      persistSession(data.token, data.expiresAt);
    } catch (err) {
      console.error("Fehler beim Login:", err);
      setErrorMessage("Der Login ist fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${backendApiUrl}/auth/dev-login`, {
        method: "POST",
      });
      if (!response.ok) {
        await handleError(response);
        return;
      }
      const data = await response.json();
      persistSession(data.token, data.expiresAt);
    } catch (err) {
      console.error("Fehler beim Dev Login:", err);
      setErrorMessage("Der Dev-Login ist fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-8">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 pt-6">
            {/* Welcome Message */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Anmeldung
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Melden Sie sich in Ihrem Konto an
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none bg-slate-50 focus:bg-white text-base"
                    placeholder="ihre.email@beispiel.de"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-4 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none bg-slate-50 focus:bg-white text-base"
                    placeholder="Ihr Passwort"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors duration-200 p-2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-red-600 bg-slate-100 border-slate-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 text-sm text-slate-600"
                  >
                    Angemeldet bleiben
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-800 underline transition-colors duration-200 text-left sm:text-right p-1"
                >
                    Passwort vergessen?
                </button>
              </div>

              {errorMessage && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 sm:py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Anmelden...
                  </>
                ) : (
                  "Anmelden"
                )}
              </button>

              {/* Dev Login Button */}
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={isLoading}
                className="w-full border border-dashed border-slate-300 text-slate-600 py-3 rounded-lg font-semibold hover:border-red-400 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {isLoading ? "Bitte warten..." : "Dev-Zugang nutzen"}
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Noch kein Konto?{" "}
                <Link
                  href="/register"
                  className="text-red-600 hover:text-red-800 font-semibold underline transition-colors duration-200 p-1"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-xs text-slate-500 px-2">
          <p className="mb-2">
            © 2024 Technische Hochschule Nürnberg Georg Simon Ohm
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button className="text-slate-600 hover:text-red-600 transition-colors duration-200 py-1">
              Impressum
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <button className="text-slate-600 hover:text-red-600 transition-colors duration-200 py-1">
              Datenschutz
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <button className="text-slate-600 hover:text-red-600 transition-colors duration-200 py-1">
              Barrierefreiheit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
