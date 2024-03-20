import "./globals.css";

import Web3Providers from "@/providers/web3Provider";
import { Capriola, Reggae_One, Unlock } from "next/font/google";

import localFont from "next/font/local";

const capriola = Capriola({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-capriola",
});

const trebuc = localFont({
  src: "../utils/fonts/trebuc.ttf",
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Trebuchet-MS",
});

const unlock = localFont({
  src: "../utils/fonts/Unlock-Regular.ttf",
  subsets: ["latin"],
  weight: "400",
  variable: "--font-unlock",
});
const reggeaOne = localFont({
  src: "../utils/fonts/ReggaeOne-Regular.ttf",
  subsets: ["latin"],
  weight: "400",
  variable: "--font-reggae-one",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${capriola.variable} ${reggeaOne.variable} ${trebuc.variable}  ${unlock.variable}`}
    >
      <Web3Providers>
        <body>{children}</body>
      </Web3Providers>
    </html>
  );
}
