import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Zap, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "signin" | "signup";
  onSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, type: initialType, onSuccess }: AuthModalProps) {
  const [type, setType] = useState(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      if (response.ok) {
        onSuccess(email);
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error. Please check your connection.");
    }
    
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-100 p-8 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-2xl" />

            <button 
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="mb-7">
              <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-600/25">
                <Zap size={22} className="text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                {type === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-gray-500">
                {type === "signin" 
                  ? "Sign in to access your AutoMesh workspace." 
                  : "Start automating your leads in minutes."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {type === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text"
                      placeholder="John Doe"
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter username"
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-sm mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <div className="flex items-center gap-2">
                    {type === "signin" ? "Sign In" : "Get Started"}
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <button 
                onClick={() => setType(type === "signin" ? "signup" : "signin")}
                className="text-sm text-gray-500 hover:text-violet-600 transition-colors font-medium"
              >
                {type === "signin" 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
