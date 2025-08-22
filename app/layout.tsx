import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/toast-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ConsoleFilterProvider } from '@/components/providers/console-filter-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sharp-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Link4Coders | The Ultimate Link-in-Bio Platform for Developers",
  description: "Showcase your projects, skills, and contributions in a way that matters to recruiters and fellow developers. Stand out with interactive code snippets, GitHub integration, and more.",
  keywords: ["link in bio", "developer portfolio", "code showcase", "github integration", "developer tools"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans`}>
        <ConsoleFilterProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ConsoleFilterProvider>
      </body>
    </html>
  );
}
