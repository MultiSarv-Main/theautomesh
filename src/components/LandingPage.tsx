import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Layers, 
  Users, 
  ArrowRight,
  Check,
  Facebook,
  Globe,
  Webhook,
  ChevronRight,
  Star
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-violet-100 overflow-x-hidden overflow-y-auto">
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
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                AutoMesh
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-7">
              {['Features', 'Integrations', 'Pricing', 'Docs'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setModalType("signin")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Sign In
            </button>
            <Button 
              onClick={() => setModalType("signup")}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold px-5 shadow-sm"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 bg-gradient-to-b from-violet-50/60 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(124,58,237,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">Lead Automation Platform</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6">
                  Automate your leads,<br />
                  <span className="text-violet-600">
                    grow your CRM.
                  </span>
                </h1>
                <p className="text-lg text-gray-500 max-w-xl mb-8 leading-relaxed">
                  Capture leads from Facebook, LinkedIn, Website and more. Instantly route them to any CRM or webhook — no coding required.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-10">
                  <Button 
                    onClick={() => setModalType("signup")}
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-600/25 transition-all"
                  >
                    Start for Free
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setModalType("signin")}
                    className="h-12 px-8 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-base rounded-xl"
                  >
                    Sign In
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Free forever plan</div>
                  <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> No credit card</div>
                  <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Setup in 5 min</div>
                </div>
              </motion.div>
            </div>

            {/* Right: App Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full max-w-xl"
            >
              <AppMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {[
              { value: "50K+", label: "Leads Processed" },
              { value: "99.9%", label: "Uptime" },
              { value: "< 1s", label: "Avg Delivery Time" },
              { value: "10+", label: "Integrations" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AutoMesh works</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Three simple steps to automate your entire lead pipeline.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect your source",
                description: "Link your Facebook Pages, website forms, or any webhook source in under a minute.",
                icon: <Facebook className="text-blue-600" size={24} />,
                color: "bg-blue-50 border-blue-100"
              },
              {
                step: "02",
                title: "Map your fields",
                description: "Drag-and-drop field mapping. Match your lead data to exactly what your CRM expects.",
                icon: <Layers className="text-violet-600" size={24} />,
                color: "bg-violet-50 border-violet-100"
              },
              {
                step: "03",
                title: "Deliver instantly",
                description: "Leads are automatically sent to your CRM the moment they come in. Real-time, every time.",
                icon: <Webhook className="text-emerald-600" size={24} />,
                color: "bg-emerald-50 border-emerald-100"
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{item.step}</div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-gray-200 z-10">
                    <ChevronRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">A complete automation platform built for modern sales teams.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Zap size={20} className="text-violet-600" />,
                bg: "bg-violet-50",
                title: "Real-Time Delivery",
                desc: "Leads are forwarded to your CRM within milliseconds of submission."
              },
              {
                icon: <Globe size={20} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Multi-Source Support",
                desc: "Facebook, LinkedIn, Website, YouTube, WordPress — all in one place."
              },
              {
                icon: <Layers size={20} className="text-indigo-600" />,
                bg: "bg-indigo-50",
                title: "Smart Field Mapping",
                desc: "Visual mapping with dynamic variables like {{full_name}}, {{email}}."
              },
              {
                icon: <Users size={20} className="text-emerald-600" />,
                bg: "bg-emerald-50",
                title: "Lead History & Logs",
                desc: "Full audit trail of every lead received, mapped, and delivered."
              },
              {
                icon: <Check size={20} className="text-amber-600" />,
                bg: "bg-amber-50",
                title: "Auth & Security",
                desc: "****** Basic auth, and custom API header support."
              },
              {
                icon: <Star size={20} className="text-pink-600" />,
                bg: "bg-pink-50",
                title: "Multiple Workflows",
                desc: "Run unlimited automation rules per page, form, or source."
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-violet-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none" />
          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">Ready to automate?</h2>
          <p className="text-lg text-violet-200 mb-8 relative z-10">Join thousands of businesses using AutoMesh to capture and route leads automatically.</p>
          <Button
            onClick={() => setModalType("signup")}
            className="h-12 px-10 bg-white text-violet-700 hover:bg-violet-50 font-bold text-base rounded-xl shadow-lg relative z-10"
          >
            Get Started Free
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="font-bold text-gray-900">AutoMesh</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => setActiveLegalPage("docs")} className="hover:text-gray-700 transition-colors">Documentation</button>
            <button onClick={() => setActiveLegalPage("privacy")} className="hover:text-gray-700 transition-colors">Privacy</button>
            <button onClick={() => setActiveLegalPage("terms")} className="hover:text-gray-700 transition-colors">Terms</button>
          </div>
          <p className="text-sm text-gray-400">© 2026 AutoMesh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function AppMockup() {
  return (
    <div className="relative">
      {/* Shadow glow */}
      <div className="absolute inset-0 bg-violet-200/40 blur-3xl rounded-3xl scale-90 -z-10" />
      
      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="text-[10px] text-gray-400 font-medium">AutoMesh — Workflows</div>
          <div />
        </div>

        {/* App content preview */}
        <div className="flex h-64">
          {/* Sidebar */}
          <div className="w-36 border-r border-gray-100 p-3 space-y-1 bg-gray-50/50">
            {[
              { label: "Dashboard", active: false },
              { label: "Workflows", active: true },
              { label: "Meta Pages", active: false },
              { label: "Lead Logs", active: false },
            ].map((item) => (
              <div key={item.label} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${item.active ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}>
                {item.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-gray-700">Active Workflows</div>
              <div className="px-2 py-1 bg-violet-600 text-white text-[9px] font-bold rounded">+ Create</div>
            </div>
            {[
              { name: "FB Lead → HubSpot", source: "Meta", status: "active" },
              { name: "Website → Salesforce", source: "Web", status: "active" },
              { name: "LinkedIn → Zoho", source: "LinkedIn", status: "paused" },
            ].map((w) => (
              <div key={w.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${w.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-[10px] font-semibold text-gray-700">{w.name}</span>
                </div>
                <span className="text-[9px] text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded">{w.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-white rounded-xl border border-gray-100 shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Zap size={12} className="text-emerald-600 fill-emerald-600" />
        </div>
        <div>
          <div className="text-[9px] text-gray-400">New Lead</div>
          <div className="text-[10px] font-bold text-gray-800">→ CRM Delivered</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-4 bg-white rounded-xl border border-gray-100 shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <Facebook size={12} className="text-blue-600" />
        </div>
        <div>
          <div className="text-[9px] text-gray-400">Meta Page</div>
          <div className="text-[10px] font-bold text-gray-800">Connected ✓</div>
        </div>
      </motion.div>
    </div>
  );
}
