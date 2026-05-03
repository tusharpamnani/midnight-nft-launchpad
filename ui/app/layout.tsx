import type { Metadata } from "next";
import { Syne, DM_Serif_Display, Martian_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from '../hooks/useWallet';

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400", "600", "700", "800"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], variable: "--font-dm-serif", weight: ["400"] });
const martianMono = Martian_Mono({ subsets: ["latin"], variable: "--font-martian-mono", weight: ["400"] });

export const metadata: Metadata = {
  title: "Midnight Privacy NFT | ZK Minting UI",
  description: "Mint and manage privacy-preserving NFTs on the Midnight network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${syne.variable} ${dmSerif.variable} ${martianMono.variable} bg-[#080810] antialiased`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
