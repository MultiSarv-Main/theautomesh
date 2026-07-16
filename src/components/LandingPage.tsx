import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Layers, 
  Users, 
  ArrowRight,
  MousePointer2,
  Server,
  Database,
  Cpu,
  Share2,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModals";
import LegalContent, { LegalPageType } from "./LegalContent";

interface LandingPageProps {
  onAuthSuccess: (email: string) => void;
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [modalType, setModalType] = useState<"signin" | "signup" | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden overflow-y-auto">
      <AnimatePresence>
        {activeLegalPage && (
          <LegalContent 
            type={activeLegalPage} 
            onClose={() => setActiveLegalPage(null)} 
          />
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        type={modalType || "signin"}
        onSuccess={onAuthSuccess}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                The AutoMesh
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Create', 'Models', 'Integrations', 'Community', 'Pricing'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setModalType("signin")}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <Button 
              onClick={() => setModalType("signup")}
              variant="outline" 
              className="rounded-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]"
            >
              Start Generating Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Design, Generate, and Launch<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                AI Models—Visually.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your intuitive visual canvas for rapid AI experimentation and deployment. 
              Build production-ready workflows in minutes, not months.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              onClick={() => setModalType("signup")}
              className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105"
            >
              Start Generating
            </Button>
            <Button 
              variant="secondary"
              className="h-12 px-8 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10"
            >
              View Templates
            </Button>
          </motion.div>

          {/* Neural Nexus Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-full max-w-5xl mx-auto aspect-[16/9] mt-10 rounded-2xl border border-white/5 bg-[#111] overflow-hidden group"
          >
             {/* 3D Visual Mockup Canvas */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
             <div className="absolute inset-0 flex items-center justify-center">
                <NeuralNexus />
             </div>
             
             {/* Overlay UI elements to make it look like a tool */}
             <div className="absolute top-4 left-4 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Engine Active</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-1 bg-white/10 rounded-full" />)}
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            {/* Box 1: Large Feature */}
            <BentoBox 
              className="md:col-span-2 md:row-span-2"
              title="Drag-and-Drop Model Builder"
              description="Visual workflow canvas to connect neural architectures effortlessly. No coding required for architectural design."
              icon={<MousePointer2 className="text-blue-400" />}
              content={
                <div className="mt-8 relative h-full overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <WorkflowVisualization />
                  </div>
                </div>
              }
            />

            {/* Box 2: API */}
            <BentoBox 
              className="md:col-span-2"
              title="Instant API Endpoint"
              description="Deploy models with a single click. Every project gets a production-grade REST endpoint automatically."
              icon={<Server className="text-violet-400" />}
              content={
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-400">POST</span>
                    <span>/v1/models/deploy</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[8px]">LIVE</span>
                  </div>
                  <div className="opacity-50">
                    {`{`} <br />
                    &nbsp;&nbsp;"model_id": "nexus-7",<br />
                    &nbsp;&nbsp;"status": "active"<br />
                    {`}`}
                  </div>
                </div>
              }
            />

            {/* Box 3: Library */}
            <BentoBox 
              title="400+ Pre-trained Models"
              description="Standardized access to GPT, Stable Diffusion, Whisper and more."
              icon={<Layers className="text-indigo-400" />}
              content={
                <div className="mt-6 flex flex-col gap-2 relative">
                  {[
                    { name: "GPT-4o", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                    { name: "Stable Diffusion XL", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
                    { name: "Whisper V3", color: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
                    { name: "Claude 3.5", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" }
                  ].map((model, i) => (
                    <motion.div 
                      key={model.name}
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`px-3 py-2 rounded-lg border ${model.color} text-[10px] font-mono flex items-center justify-between group/model cursor-default`}
                    >
                      <span>{model.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover/model:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-12 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
                </div>
              }
            />

            {/* Box 4: Collaboration */}
            <BentoBox 
              title="Real-Time Collaboration"
              description="Animate and build together with team syncing. See changes live."
              icon={<Share2 className="text-pink-400" />}
              content={
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex -space-x-3">
                    {[
                      { bg: "bg-blue-500", label: "JD" },
                      { bg: "bg-violet-500", label: "AS" },
                      { bg: "bg-pink-500", label: "MK" },
                      { bg: "bg-slate-700", label: "+12" }
                    ].map((user, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-10 h-10 rounded-full border-2 border-[#111] ${user.bg} flex items-center justify-center text-[10px] font-bold shadow-lg shadow-black/40`}
                      >
                        {user.label}
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      <span className="text-[10px] text-white/50">Alex is editing <span className="text-white/80">Workflow_Alpha</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-pink-500/50"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "65%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-white/35 text-sm">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            <span className="font-bold">The AutoMesh</span>
          </div>
          <div className="flex gap-8">
            <button onClick={() => setActiveLegalPage("docs")} className="hover:text-white transition-colors cursor-pointer">Documentation</button>
            <button onClick={() => setActiveLegalPage("privacy")} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
            <button onClick={() => setActiveLegalPage("terms")} className="hover:text-white transition-colors cursor-pointer">Terms</button>
          </div>
          <p>© 2026 The AutoMesh. Proudly built by The AutoMesh.</p>
        </div>
      </footer>
    </div>
  );
}

function BentoBox({ title, description, icon, content, className = "" }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-3xl bg-[#111] border border-white/5 flex flex-col relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed relative z-10">{description}</p>
      {content}
    </motion.div>
  );
}

function NeuralNexus() {
  return (
    <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-100">
      <div className="absolute w-[400px] h-[400px] border border-blue-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
      <div className="absolute w-[300px] h-[300px] border border-violet-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      <div className="absolute w-[200px] h-[200px] border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
      
      {/* Mesh simulation */}
      <svg className="w-[500px] h-[500px] relative z-10 overflow-visible" viewBox="0 0 500 500">
        <defs>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Animated points */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = 250 + Math.cos(angle) * 150;
          const y = 250 + Math.sin(angle) * 150;
          
          return (
            <g key={i}>
              {/* Lines connecting to center */}
              <motion.line 
                x1="250" y1="250" x2={x} y2={y}
                stroke="white" 
                strokeWidth="0.5" 
                strokeOpacity="0.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
              {/* Floating dots */}
              <motion.circle
                cx={x} cy={y} r="3"
                fill="url(#dotGlow)"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              />
            </g>
          );
        })}
        
        {/* Central Core */}
        <motion.circle 
          cx="250" cy="250" r="40" 
          className="fill-blue-600/20 stroke-blue-500/40"
          strokeWidth="1"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <Zap className="text-white fill-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ x: 234, y: 234 }} size={32} />
      </svg>
    </div>
  );
}

function WorkflowVisualization() {
  return (
    <div className="flex gap-4 p-8">
      <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center animate-pulse">
        <Database size={24} className="text-blue-400" />
      </div>
      <div className="flex flex-col justify-center gap-2">
        <div className="w-10 h-0.5 bg-white/10 rounded-full" />
        <div className="w-10 h-0.5 bg-white/10 rounded-full" />
      </div>
      <div className="w-16 h-16 rounded-3xl border border-blue-500/50 bg-blue-500/10 flex items-center justify-center">
        <Cpu size={24} className="text-blue-400" />
      </div>
      <div className="flex flex-col justify-center gap-2">
        <div className="w-10 h-0.5 bg-white/10 rounded-full" />
        <div className="w-10 h-0.5 bg-white/10 rounded-full" />
      </div>
      <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
        <Globe size={24} className="text-violet-400" />
      </div>
    </div>
  );
}
