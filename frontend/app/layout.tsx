import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'LLM Ops Dashboard',
  description: 'Pro-grade Monitoring for LLM Applications',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="e" className="dark">
      <body className="antialiased bg-slate-950 text-slate-200">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 pl-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
