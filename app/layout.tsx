import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./design-system.css";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Gyankunj — Your Knowledge Universe",
  description: "A more intentional way to prepare, practice and grow.",
  applicationName: "Gyankunj",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071521",
};
const themeBootstrap = `(function(){try{var k="gyankunj-design-studio-v1",p=JSON.parse(localStorage.getItem(k)||"null"),d=p&&["compact","comfortable","spacious"].includes(p.density)?p.density:"comfortable",m=p&&["minimal","dynamic","expressive"].includes(p.motion)?p.motion:"dynamic",r=document.documentElement;r.dataset.theme="dark";r.dataset.style="cosmic";r.dataset.density=d;r.dataset.motion=m;r.style.colorScheme="dark";localStorage.setItem(k,JSON.stringify({style:"cosmic",theme:"dark",density:d,motion:m}));}catch(e){var r=document.documentElement;r.dataset.theme="dark";r.dataset.style="cosmic";r.dataset.density="comfortable";r.dataset.motion="dynamic";r.style.colorScheme="dark";}})();`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
