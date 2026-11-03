import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Gyankunj — Your Knowledge Universe",
  description: "A more intentional way to prepare, practice and grow.",
  applicationName: "Gyankunj",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff5fa",
};
const themeBootstrap = `(function(){try{var t=localStorage.getItem("gyankunj-theme");if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
