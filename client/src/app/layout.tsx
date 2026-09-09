import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 z-10">
                {children}
              </main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
