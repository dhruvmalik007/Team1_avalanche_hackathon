'use client';

import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function Topbar() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  return (
    <header className="topbar">
      <Link href="/homepage" className="link">Environments Hub</Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {authenticated ? (
          <>
            <Link className="btn" href="/dashboard/profile">Profile</Link>
            <Link className="btn" href="/dashboard/history">History</Link>
            <span style={{ opacity: 0.8, fontSize: 14 }}>
              {primaryAddress ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}` : 'Signed in'}
            </span>
            <button className="btn" onClick={() => logout()}>Logout</button>
          </>
        ) : (
          <button className="btn" onClick={() => login()} disabled={!ready}>Sign In</button>
        )}
        <Link className="btn btn-accent" href="/dashboard/environments/new">Create Environment</Link>
      </div>
    </header>
  );
}
