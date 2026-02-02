import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Exam Tracker",
  description: "Track your exams and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // FIX: suppressHydrationWarning added to HTML tag
    <html lang="en" suppressHydrationWarning>
      {/* FIX: suppressHydrationWarning added to BODY tag */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}