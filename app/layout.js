import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'iLoveSleep Mini POS',
  description: 'ระบบขายของหน้าร้าน iLoveSleep',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header className="app-header">
          <div className="brand-title">iLoveSleep Mini POS</div>
          <nav className="main-nav">
            <Link href="/" className="nav-link">
              จัดการสินค้า
            </Link>
            <Link href="/sell" className="nav-link">
              ขายสินค้า
            </Link>
            <Link href="/history" className="nav-link">
              ประวัติการขาย
            </Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
