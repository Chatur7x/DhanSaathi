import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import { SmoothScroll } from '@/components/smooth-scroll';

export const metadata: Metadata = {
  title: 'DhanSaathi — Your Wealth Companion',
  description: 'Calm, minimal investing: live markets, portfolio, calculators and AI insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/25">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="dhansaathi-theme-v2">
          <Providers>
            <SmoothScroll>
            <div className="grain-overlay" aria-hidden />
            <div className="relative flex min-h-screen flex-col">
              <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 z-10">
                {children}
              </main>
            </div>
            </SmoothScroll>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
