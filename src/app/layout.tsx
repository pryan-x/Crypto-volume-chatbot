import type { Metadata } from 'next';
import './globals.css';
import { AI } from './ai';

export const metadata: Metadata = {
  title: 'Chatbot with Binance integration for checking ticker volume',
  description: 'A project utilizing a chatbot integrated with binance to fetch ticker data, specifically volume',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AI>{children}</AI>
      </body>
    </html>
  );
}