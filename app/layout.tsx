import "./globals.css";
import type { Metadata, Viewport } from "next";

const APP_NAME = "AI Fluency - Nudgeable";
const APP_DESCRIPTION = "AI Fluency Isn't a Course. It's a Daily Habit";

export const metadata: Metadata = {
  title: "AI Fluency - Nudgeable",
  description: "AI Fluency Isn't a Course. It's a Daily Habit",
  keywords: ["AI", "AI Fluency", "AI Literacy", "AI Education", "AI Training", "AI Skills", "AI Development", "AI Skills Training", "AI Skills Development", "AI Skills Training", "AI Skills Development"],
  authors: [{ name: "Nudgeable AI", url: "https://nudgeable.ai" }],
  creator: "Nudgeable AI",
  publisher: "Nudgeable AI",
  openGraph: {
    title: "AI Fluency - Nudgeable",
    description: "AI Fluency Isn't a Course. It's a Daily Habit",
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
