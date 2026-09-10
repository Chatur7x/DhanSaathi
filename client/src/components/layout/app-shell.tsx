"use client";

import { Sidebar, BottomNav } from "@/components/layout/navigation";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Sidebar />
      <BottomNav />
      <div className="lg:pl-[248px] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </>
  );
}
