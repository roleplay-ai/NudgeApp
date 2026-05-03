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
        nblue: "#623CEA",
        norange: "#F68A29",
        chiffon: "#FFF6CF",
        emerald: "#23CE68",
        fuchsia: "#ED4551",
        dodger: "#3696FC",
        bg: "#FFFDF5",
        nborder: "#E8E6DC",
        muted: "#6B6B6B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;
