import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./aether-liquid-glass.css";
import ThemeProvider from "@/components/theme-provider";
import StudentFloatingNavigation from "@/components/student-floating-navigation";

export const metadata: Metadata = {
  title: "Gyankunj — Your Knowledge Universe",
  description: "A more intentional way to prepare, practice and grow.",
  applicationName: "Gyankunj",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eee8f6",
};
const themeBootstrap = `(function(){try{var k="gyankunj-design-studio-v1",p=JSON.parse(localStorage.getItem(k)||"null"),d=p&&["compact","comfortable","spacious"].includes(p.density)?p.density:"comfortable",m=p&&["minimal","dynamic","expressive"].includes(p.motion)?p.motion:"dynamic",c=p&&["lilac","nebula","rose","ocean","aurora","coral"].includes(p.palette)?p.palette:"lilac",g=p&&["frosted","clear","chromatic","liquid"].includes(p.glass)?p.glass:"frosted",i=p&&typeof p.glassIntensity==="number"?Math.min(100,Math.max(20,p.glassIntensity)):72,r=document.documentElement;r.dataset.theme="light";r.dataset.style="cosmic";r.dataset.density=d;r.dataset.motion=m;r.dataset.palette=c;r.dataset.glass=g;r.style.setProperty("--gk-glass-intensity",String(i/100));r.style.colorScheme="light";localStorage.setItem(k,JSON.stringify({style:"cosmic",theme:"light",density:d,motion:m,palette:c,glass:g,glassIntensity:i}));}catch(e){var r=document.documentElement;r.dataset.theme="light";r.dataset.style="cosmic";r.dataset.density="comfortable";r.dataset.motion="dynamic";r.style.colorScheme="light";}})();`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body><ThemeProvider>{children}<StudentFloatingNavigation/></ThemeProvider></body>
    </html>
  );
}
