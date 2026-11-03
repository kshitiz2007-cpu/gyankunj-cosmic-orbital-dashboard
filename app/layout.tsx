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
  themeColor: "#071521",
};
const themeBootstrap = `(function(){try{var k="gyankunj-design-studio-v1",p=JSON.parse(localStorage.getItem(k)||"null"),old=localStorage.getItem("gyankunj-theme-v3"),t=p&&p.theme==="light"?"light":p&&p.theme==="dark"?"dark":old==="light"?"light":"dark",s=p&&["cosmic","aurora","editorial","brutal","glass","minimal"].includes(p.style)?p.style:"brutal",d=p&&["compact","comfortable","spacious"].includes(p.density)?p.density:"comfortable",m=p&&["minimal","dynamic","expressive"].includes(p.motion)?p.motion:"dynamic",r=document.documentElement;r.dataset.theme=t;r.dataset.style=s;r.dataset.density=d;r.dataset.motion=m;r.style.colorScheme=t;}catch(e){var r=document.documentElement;r.dataset.theme="dark";r.dataset.style="brutal";r.dataset.density="comfortable";r.dataset.motion="dynamic";r.style.colorScheme="dark";}})();`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
