import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';

export const metadata: Metadata = {
  title: 'Airflow',
  description: 'The AI boost to your webflow.',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className="bg-white dark:bg-gray-950">
      <body 
        className="min-h-[100dvh] bg-gray-50"
        suppressHydrationWarning
        data-new-gr-c-s-check-loaded="14.1204.0"
        data-gr-ext-installed=""
      >
        <UserProvider userPromise={Promise.resolve(user)}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
