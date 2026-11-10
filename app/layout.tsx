import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Telegram Web',
  description: 'High-fidelity Telegram Web and Desktop messaging application featuring real-time chats, groups, voice/video calls UI, media sharing, Cloud SQL persistence, Firebase authentication, and AI assistant.',
  openGraph: {
    title: 'Telegram Web',
    description: 'High-fidelity Telegram Web and Desktop messaging application featuring real-time chats, groups, voice/video calls UI, media sharing, Cloud SQL persistence, Firebase authentication, and AI assistant.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telegram Web',
    description: 'High-fidelity Telegram Web and Desktop messaging application featuring real-time chats, groups, voice/video calls UI, media sharing, Cloud SQL persistence, Firebase authentication, and AI assistant.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
