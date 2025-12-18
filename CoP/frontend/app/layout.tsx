"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen">
            <header className="border-b bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-8">
                    <a href="/" className="text-xl font-bold text-slate-900">
                      CoP Portal
                    </a>
                    <nav className="flex gap-4">
                      <a
                        href="/cops"
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        CoPs
                      </a>
                      <a
                        href="/admin"
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        Admin
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
