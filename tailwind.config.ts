import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gray Scale - Dùng cho Text, Border, Background
        gray: {
          50: "#F8F9FA",
          100: "#F1F2F4",
          200: "#D1D5DB",
          300: "#B3B8C2",
          400: "#9DA4B0",
          500: "#8E94A3",
          600: "#717684",
          700: "#4B4E59",
          800: "#373A41",
          900: "#1C1E23",
        },
        // Primary - Màu chủ đạo (Xanh tím)
        primary: {
          100: "#EEF0FF",
          200: "#D2D6FF",
          300: "#A5ACFF",
          400: "#838BFF",
          500: "#5D5FEF",
          600: "#4A4CD9",
          700: "#3739B3",
          800: "#26288C",
          900: "#10113B",
        },
        // Secondary - Màu bổ trợ (Cam)
        secondary: {
          100: "#FFF0EB",
          200: "#FFD9CC",
          300: "#FFB399",
          400: "#FF8C66",
          500: "#FF6B3D",
          600: "#E65A2E",
          700: "#B34624",
          800: "#80321A",
          900: "#4D1E10",
        },
        // Success - Trạng thái hoàn thành, thành công
        success: {
          100: "#E7F7ED",
          200: "#CEF0DB",
          300: "#9DE0B7",
          400: "#6CD193",
          500: "#27AE60",
          600: "#219653",
          700: "#19703E",
          800: "#114D2B",
          900: "#082615",
        },
        // Warning - Cảnh báo, chờ duyệt
        warning: {
          100: "#FFF5E9",
          200: "#FFEBCC",
          300: "#FFD699",
          400: "#FFC266",
          500: "#F2994A",
          600: "#D98942",
          700: "#A66932",
          800: "#734923",
          900: "#402914",
        },
        // Danger - Lỗi, xóa, nguy hiểm
        danger: {
          100: "#FEEFF0",
          200: "#FCD9DB",
          300: "#F9B3B7",
          400: "#F68D93",
          500: "#EB5757",
          600: "#D14D4D",
          700: "#9E3A3A",
          800: "#6B2727",
          900: "#381414",
        },
      },
      fontFamily: {
        // Ghi đè font sans mặc định bằng Inter
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        logo: ["Fortusnova", "serif"], // Font CF Fortusnova định nghĩa ở globals.css
        general: ["General Sans", "sans-serif"], // Font General Sans định nghĩa ở globals.css
      },
    },
  },
  plugins: [],
};
export default config;
