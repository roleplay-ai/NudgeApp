import "./globals.css";
import type { Metadata, Viewport } from "next";
import { COMPANY_NAME, SITE_ORIGIN } from "@/lib/site";

const APP_NAME = COMPANY_NAME;
const APP_DESCRIPTION = "AI Fluency Isn't a Course. It's a Daily Habit";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: ["AI", "AI Fluency", "AI Literacy", "AI Education", "AI Training", "AI Skills", "AI Development", "AI Skills Training", "AI Skills Development", "AI Skills Training", "AI Skills Development"],
  authors: [{ name: COMPANY_NAME, url: SITE_ORIGIN }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.jpeg",
  },



};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
