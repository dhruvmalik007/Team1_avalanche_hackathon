import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Environments Hub',
  description: 'Avalanche-RL environments hub with Privy login',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Topbar />
          <main className="container">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
