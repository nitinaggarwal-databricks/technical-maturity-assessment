import "./../styles/globals.css";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export const metadata = {
  title: "CoP Portal",
  description: "Community of Practice Portal for Databricks Customers"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col">
            <header className="border-b bg-white">
              <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                <div className="font-semibold text-lg">CoP Portal</div>
                <nav className="space-x-4 text-sm">
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                  <a href="/cops" className="hover:underline">
                    CoPs
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
              {children}
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}

