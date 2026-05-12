import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SK Bags",
  description: "Premium handmade bags delivered across Egypt.",
  icons: {
    icon: "/sk.png",
    shortcut: "/sk.png",
    apple: "/sk.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
