import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import Navbar from "@/components/Navbar"; // 1. Import the Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interview Prep Platform",
  description: "Master your technical interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Place Navbar above the wrapper so it shows on every page */}
        <Navbar />
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}