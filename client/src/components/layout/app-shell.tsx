"use client";

import { Sidebar, BottomNav } from "@/components/layout/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <BottomNav />
      <div className="lg:pl-[260px] min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </>
  );
}
