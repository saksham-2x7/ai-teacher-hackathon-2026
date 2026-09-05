import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEXAGON | Your Personal AI Teacher",
  description: "A personal AI teacher that explains, asks questions, and adapts lessons to how you learn best.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-hexagon-accent selection:text-black">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
