import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/provider/providers";
import "dotenv/config.js";
import Header from "@/components/header/Header";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Agent.Land",
  description: "AI x MEME",
  icons: {
    icon: ["./favicon.svg"],
    apple: ["./favicon.svg"],
    shortcut: ["./favicon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header></Header>
          <div className="m-auto w-screen max-w-[1216px] px-2 sm:px-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
