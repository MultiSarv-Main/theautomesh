import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "signin" | "signup";
  onSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, type: initialType, onSuccess }: AuthModalProps) {
  const [type, setType] = useState(initialType);
  const [email, setEmail] = useState("rr");
  const [password, setPassword] = useState("sss");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        onSuccess(email);
      }
    } catch (err) {
      console.error("Auth error:", err);
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
            className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl border border-white/10 bg-[#111] p-8 shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] pointer-events-none rounded-full" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6">
                <Zap size={24} className="text-blue-400 fill-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {type === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-white/40">
                {type === "signin" 
                  ? "Enter your details to access your workspace." 
                  : "Start building and deploying AI models in minutes."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input 
                      type="text"
                      placeholder="John Doe"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Username</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={16} />
                  <input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter username"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={16} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 mt-4 h-12"
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

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button 
                onClick={() => setType(type === "signin" ? "signup" : "signin")}
                className="text-sm text-white/40 hover:text-white transition-colors"
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
