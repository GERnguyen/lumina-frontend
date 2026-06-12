import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

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
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
