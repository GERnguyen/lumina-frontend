import { Inter } from "next/font/google";
import "@/styles/globals.css";

// Cấu hình font Inter
const inter = Inter({
  subsets: ["latin", "vietnamese"], // Thêm vietnamese để hiển thị tiếng Việt chuẩn
  display: "swap",
  variable: "--font-inter", // Tạo một biến CSS variable để Tailwind dùng
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
