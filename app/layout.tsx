import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import SuggestionsRail from "@/components/SuggestionsRail";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNSTAGRAM",
  description: "Instagram, but we deleted the pictures.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-paper">
        <div className="mx-auto flex w-full max-w-[1100px] justify-center">
          <Sidebar />
          <main className="min-w-0 flex-1 border-x border-hairline px-5 pb-24 pt-6 md:max-w-[640px]">
            {children}
          </main>
          <SuggestionsRail />
        </div>
        {/* mobile bottom nav handled by Sidebar visibility; kept minimal for concept */}
      </body>
    </html>
  );
}
