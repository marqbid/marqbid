// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteName = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'MarqBid';

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Let Realtors Compete for Your Listing`,
    template: `%s | ${siteName}`,
  },
  description:
    'Post your home, have licensed realtors bid on their commission. Save thousands versus standard rates. Free to browse, just $9.99 to list. Named for its founder — Mark it, bid it, sell it.',
  openGraph: {
    title: `${siteName} — Let Realtors Compete for Your Listing`,
    description: 'Post your home, have licensed realtors bid on their commission.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
