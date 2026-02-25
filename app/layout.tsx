import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: {
    default: "RecruitBoost - Athletic Recruiting Platform",
    template: "%s | RecruitBoost",
  },
  description:
    "Streamline your college athletic recruiting with AI-powered outreach, coach database management, and email tracking.",
  openGraph: {
    title: "RecruitBoost - Athletic Recruiting Platform",
    description:
      "Streamline your college athletic recruiting with AI-powered outreach, coach database management, and email tracking.",
    type: "website",
    url: "https://recruitboost.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecruitBoost - Athletic Recruiting Platform",
    description:
      "Streamline your college athletic recruiting with AI-powered outreach, coach database management, and email tracking.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
