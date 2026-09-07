import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/app/components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inim - Data Collection & Task Management",
  description: "A comprehensive data collection and task management platform",
  icons: {
    icon: "/logo/sanchay-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <Toaster richColors position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}