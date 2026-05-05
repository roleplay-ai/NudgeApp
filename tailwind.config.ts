import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: "#FFCE00",
        shadow: "#221D23",
        ink: "#121212",
        nblue: "#623CEA",
        norange: "#F68A29",
        chiffon: "#FFF6CF",
        emerald: "#23CE68",
        fuchsia: "#ED4551",
        dodger: "#3696FC",
        bg: "#FCFAF2",
        nborder: "#E8E6DC",
        muted: "#6B6B6B",
        /* Nudgeable AI home reference (warm editorial) */
        homeCanvas: "#f5f0e8",
        homeInk: "#1c1814",
        homeSidebar: "#1a1614",
        homeClay: "#C07B3A",
        homeNavMuted: "#7a6a5a",
        homeSubtle: "#9e8e7a",
        homeBodyMuted: "#6b5f52",
        homeWarmGray: "#a89880",
        homeBulletMuted: "#d0c4b4",
        homeDivider: "#f0ebe0",
        /** Watch-this-week panel border (reference HTML) */
        homeShellLine: "#e8e2d8",
        /** Creator line on dark video cards */
        homeVideoMeta: "#5a4e44",
        homeCtaGreen: "#2d5a3d",
        homeCtaNavy: "#1e3a5f",
        homeCtaPurple: "#4a2060",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
