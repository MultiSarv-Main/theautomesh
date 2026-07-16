import { motion } from "motion/react";
import { X, ArrowLeft, Book, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LegalPageType = "docs" | "privacy" | "terms";

interface LegalContentProps {
  type: LegalPageType;
  onClose: () => void;
}

export default function LegalContent({ type, onClose }: LegalContentProps) {
  const content = {
    docs: {
      title: "Documentation",
      icon: <Book className="text-blue-400" />,
      sections: [
        {
          title: "Getting Started",
          text: "Welcome to AI Studio (The AutoMesh). To start, create a new pipeline using our visual builder. Drag nodes from the library to the canvas and connect them to create complex AI workflows."
        },
        {
          title: "Model Deployment",
          text: "Once your workflow is tested, click 'Deploy' to generate a production-ready API endpoint. This endpoint can be integrated into any application using standard REST calls."
        },
        {
          title: "Custom Models",
          text: "Upload your own specialized models or use our library of 400+ pre-trained architectures including GPT-4o, Claude, and Stable Diffusion."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Shield className="text-emerald-400" />,
      sections: [
        {
          title: "Data Collection",
          text: "We collect only the necessary information to provide our services. This includes your email for account identification and usage logs to improve system performance."
        },
        {
          title: "Model Privacy",
          text: "Your custom models and datasets are yours alone. We do not use your proprietary data to train our base models unless you explicitly opt into our community training program."
        },
        {
          title: "Third-party Services",
          text: "When using integrated models (like OpenAI or Anthropic), data is processed according to their respective privacy policies. We ensure encrypted transmission for all data in transit."
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="text-violet-400" />,
      sections: [
        {
          title: "Usage Limits",
          text: "Free tier accounts are limited to experimental usage. Production workloads require an Enterprise plan to ensure high availability and rate-limit stability."
        },
        {
          title: "Intellectual Property",
          text: "You retain all rights to the workflows and outputs generated on our platform. AI Studio (The AutoMesh) grants you a worldwide, non-exclusive license to use the service."
        },
        {
          title: "Acceptable Use",
          text: "The platform must not be used for generating harmful, illegal, or deceptive content. We reserve the right to terminate accounts that violate these safety guidelines."
        }
      ]
    }
  }[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-[#0a0a0a] overflow-y-auto px-6 py-20 md:py-32"
    >
      <div className="max-w-3xl mx-auto border border-white/5 bg-[#111] rounded-3xl p-8 md:p-12 relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm group"
        >
          <span className="hidden md:inline group-hover:underline">Back to Landing</span>
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            {content.icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{content.title}</h1>
            <p className="text-white/40 mt-1">Last updated: April 29, 2026</p>
          </div>
        </div>

        <div className="space-y-12">
          {content.sections.map((section, i) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-white/90 underline decoration-blue-500/30 decoration-4 underline-offset-8">
                {section.title}
              </h2>
              <p className="text-white/50 leading-relaxed text-lg">
                {section.text}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 text-center">
          <Button 
            onClick={onClose}
            className="rounded-full bg-blue-600 hover:bg-blue-500"
          >
            I Understand
          </Button>
        </div>
      </div>
      
      {/* Footer for the legal page */}
      <div className="max-w-3xl mx-auto mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
        AI Studio — The AutoMesh — Global Standard Compliance
      </div>
    </motion.div>
  );
}
