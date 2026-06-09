import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBar from "@/components/MobileBar";
import SuggestionsRail from "@/components/SuggestionsRail";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.workers.dev";
const DESCRIPTION =
  "UNSTAGRAM is a text-only social feed: you post a photo and your followers read an AI-written description instead. The image is never shown and never stored. A chronological, privacy-first, text-only social feed.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "UNSTAGRAM — photos you read, not see",
    template: "%s · UNSTAGRAM",
  },
  description: DESCRIPTION,
  applicationName: "UNSTAGRAM",
  keywords: [
    "UNSTAGRAM", "text-only social network", "AI image description",
    "privacy-first social media", "chronological feed", "no algorithm", "describe photos with AI",
  ],
  authors: [{ name: "UNSTAGRAM" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "UNSTAGRAM",
    title: "UNSTAGRAM — photos you read, not see",
    description: DESCRIPTION,
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "UNSTAGRAM — photos you read, not see",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
        {process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}`}
          />
        )}
      </head>
      <body className="min-h-screen bg-ink text-paper">
        <MobileTopBar />
        <div className="mx-auto flex w-full max-w-[1100px] justify-center">
          <Sidebar />
          <main className="min-w-0 flex-1 border-x border-hairline px-5 pb-24 pt-6 md:max-w-[640px]">
            {children}
          </main>
          <SuggestionsRail />
        </div>
        <MobileBar />
      </body>
    </html>
  );
}
