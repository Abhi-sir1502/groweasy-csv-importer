import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12131C",
        paper: "#F3F2ED",
        panel: "#FFFFFF",
        indigo: "#3D3AA8",
        indigoDeep: "#252361",
        lime: "#C6FF5C",
        limeDeep: "#8FCE1F",
        line: "#E1DFD6",
        muted: "#6B6A63",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
