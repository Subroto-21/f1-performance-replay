import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata = {
  title: "F1 Performance Replay",
  description: "Analyst workbench for F1 session and telemetry data, built on FastF1.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <NavBar />
        <main className="pt-12 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
