import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthSuccess } = useAuth();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google sign in was cancelled or failed");
        setIsProcessing(false);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setIsProcessing(false);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        const response = await api.post("/auth/google/callback", { code });
        const { access_token } = response;
        localStorage.setItem("learnflow-token", access_token);
        
        const userResponse = await api.get("/auth/me");
        handleOAuthSuccess(access_token, userResponse);

        if (userResponse.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Google callback error:", err);
        const errorMessage = err.message || "Failed to complete Google sign in";

        if (
          errorMessage.includes("invalid_grant") ||
          errorMessage.includes("400")
        ) {
          setError("Your session has expired. Please try signing in with Google again.");
        } else {
          setError(errorMessage);
        }
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, handleOAuthSuccess]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Completing Google sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger-600 dark:text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign In Failed</h2>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign In Successful</h2>
            <p className="text-slate-600 dark:text-slate-400">Redirecting to your dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
