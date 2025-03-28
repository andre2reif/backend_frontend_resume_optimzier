import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CV Optimizer',
  description: 'Optimieren Sie Ihren Lebenslauf für ATS-Systeme',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="de" data-theme="light">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Toaster position="top-center" />
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
} 