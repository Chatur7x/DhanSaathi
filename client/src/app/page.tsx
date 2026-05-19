"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, Shield, Zap, Database, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl space-y-6"
      >
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse mr-2"></span>
          Enterprise Architecture Deployed
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          Welcome to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            DhanSaathi Pro
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The foundation has been rewritten. Next.js 15 App Router, Tailwind CSS, Shadcn UI, and Prisma ORM — ready to scale to millions of Indian investors.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 w-full sm:w-auto shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all">
            Launch Trading Terminal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-12 w-full sm:w-auto border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300">
            View Architecture Docs
          </Button>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
      >
        {[
          { icon: Brain, title: "Next.js 15 Serverless", desc: "Full-stack API routes & SSR for perfect SEO on financial academy articles.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { icon: Database, title: "Prisma ORM", desc: "Enterprise database layer. Switch from SQLite to PostgreSQL by changing one word.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { icon: Zap, title: "Tailwind + Shadcn", desc: "UI/UX Pro Max styling. 3x faster development with radically accessible components.", color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((feature, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 hover:border-slate-700 transition-colors">
            <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            {/* Hover Glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
