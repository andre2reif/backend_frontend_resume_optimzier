import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
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
          <main className="min-h-screen">
            <Toaster 
              position="bottom-left"
              toastOptions={{
                className: 'toast-start !bg-black !text-white',
                duration: 5000,
                style: {
                  background: 'black',
                  color: 'white',
                },
              }}
            />
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
} 