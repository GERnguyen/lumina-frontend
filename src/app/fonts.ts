import { Noto_Sans } from "next/font/google";

export const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-noto-sans",
  fallback: ["ui-sans-serif", "system-ui", "Arial"],
});
