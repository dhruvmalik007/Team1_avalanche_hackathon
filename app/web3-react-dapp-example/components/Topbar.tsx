'use client';

import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from './ui/button';

export default function Topbar() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  return (
    <header className="topbar">
      <Link href="/" className="link">Environments Hub</Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {authenticated ? (
          <>
            <Link href="/dashboard/profile"><Button variant="outline">Profile</Button></Link>
            <Link href="/dashboard/history"><Button variant="outline">History</Button></Link>
            <span style={{ opacity: 0.8, fontSize: 14 }}>
              {primaryAddress ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}` : 'Signed in'}
            </span>
            <Button onClick={() => logout()}>Logout</Button>
          </>
        ) : (
          <Button onClick={() => login()} disabled={!ready} isLoading={!ready}>Sign In</Button>
        )}
        <Link href="/dashboard/environments/new"><Button variant="accent">Create Environment</Button></Link>
      </div>
    </header>
  );
}
