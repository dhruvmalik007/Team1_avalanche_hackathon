'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="brand">Avalanche RL Hub</div>
        <div className="copyright">© {new Date().getFullYear()} Avalanche RL Hub</div>
      </div>
      <nav className="footer-nav">
        <Link href="#" className="footer-link">Careers</Link>
        <Link href="#" className="footer-link">Writings</Link>
        <Link href="#" className="footer-link">Terms of Service</Link>
        <Link href="#" className="footer-link">Privacy Policy</Link>
        <Link href="#" className="footer-link">Contact</Link>
      </nav>
    </footer>
  );
}
