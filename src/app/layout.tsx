import type { Metadata } from "next";
import "@/styles/globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://kevinleonjouvin.com"),
  title: {
    default: "lrcat",
    template: "%s | lrcat"
  },
  description: "Minimal Lightroom replacement to publish photo stories quickly.",
  openGraph: {
    type: "website",
    siteName: "lrcat",
    url: "https://kevinleonjouvin.com",
    description: "Minimal Lightroom replacement to publish photo stories quickly."
  },
  twitter: {
    card: "summary_large_image",
    creator: "@kevinleonjouvin"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-neutral-950 text-neutral-100">
        <Header />
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32 sm:px-10">
          {children}
        </main>
        <Footer />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
