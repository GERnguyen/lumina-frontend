import { Manrope } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Lumina",
    template: "%s | Lumina",
  },
  description:
    "Lumina is an online learning platform for discovering courses, learning with interactive lessons, and managing instructor content.",
  applicationName: "Lumina",
  metadataBase: new URL("https://shiny.id.vn"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={manrope.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
