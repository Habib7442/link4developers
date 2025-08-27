import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ConsoleFilterProvider } from "@/components/providers/console-filter-provider";
import { RateLimitErrorProvider } from "@/components/providers/rate-limit-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Link4Coders - Developer Link-in-Bio Platform",
  description: "Create beautiful, customizable link-in-bio pages for developers. Showcase your projects, blogs, and social media in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConsoleFilterProvider>
          <QueryProvider>
            <AuthProvider>
              <RateLimitErrorProvider>
                <ToastProvider />
                {children}
              </RateLimitErrorProvider>
            </AuthProvider>
          </QueryProvider>
        </ConsoleFilterProvider>
      </body>
    </html>
  );
}
