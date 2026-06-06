import type { Config } from "tailwindcss";

// Design system — Blueprint §08 (dark + serif + emerald calm)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0D",        // primary background — deep, eye-respecting
        surface: "#161616",    // card / raised surface
        emerald: "#3D8B6A",    // accent — emerald calm
        paper: "#F0F0F0",      // text primary — soft white
        ash: "#A0A0A0",        // text secondary — medium gray
        hairline: "#262626",   // borders / dividers
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: { reading: "44rem" },
    },
  },
  plugins: [],
};
export default config;
