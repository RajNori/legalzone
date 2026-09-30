import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalZone',
  description: 'Interactive legal document generators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
