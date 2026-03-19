import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import "./globals.css";
import { initSentry } from "@/lib/utils/sentry";
import { initPostHog } from "@/lib/utils/posthog";

// Initialize at the top level
if (typeof window !== "undefined") {
  initSentry();
  initPostHog();
}

export const metadata: Metadata = {
  title: "SplitRent",
  description:
    "Never chase roommates for rent again. SplitRent helps groups pay rent cleanly on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const saved = localStorage.getItem("theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const dark = saved ? saved === "dark" : prefersDark;
                  document.documentElement.classList.toggle("dark", dark);
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
