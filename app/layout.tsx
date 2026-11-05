import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gyankunj | Learn Beyond Boundaries',
  description: 'Your cosmic learning space for UPSC, State PCS, SSC and beyond.',
  applicationName: 'Gyankunj',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#160d20',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
