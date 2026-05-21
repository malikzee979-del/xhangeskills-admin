import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthContext';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'XchangeSkills Admin',
  description: 'Admin panel for XchangeSkills platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
