import "antd/dist/reset.css";
import { ConfigProvider } from "antd";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import { theme } from "../theme";
import Navbar from "@/components/NavBar";

export const metadata = {
  title: "F1 Performance Replay",
  description: "Animated F1-themed website built with Next.js + Framer Motion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={theme}>
          <Navbar />
          <main className="pt-16">
            <ClientWrapper>{children}</ClientWrapper>
          </main>
        </ConfigProvider>
      </body>
    </html>
  );
}
