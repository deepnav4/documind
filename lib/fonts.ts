import { Fraunces, Instrument_Serif, Inter } from "next/font/google";

export const marker = Fraunces({
  variable: "--font-shadow",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: "normal",
});

export const sans = Inter({
  variable: "--font-shadow",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal" , "italic"],
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ['400']
})
