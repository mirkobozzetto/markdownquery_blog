import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";

const dm_mono = DM_Mono({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "GitHub-Powered Blog",
  description:
    "Ce projet est un blog innovant qui utilise GitHub comme système de gestion de contenu (CMS)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dm_mono.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
