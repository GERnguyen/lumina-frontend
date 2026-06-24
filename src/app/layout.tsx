import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { notoSans } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Cinx",
    template: "%s | Cinx",
  },
  description:
    "Cinx is an online learning platform for discovering courses, learning with interactive lessons, and managing instructor content.",
  applicationName: "Cinx",
  metadataBase: new URL("https://shiny.id.vn"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={notoSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
