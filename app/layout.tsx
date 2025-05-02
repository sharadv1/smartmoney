import './globals.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider, ToastEventListener } from "@/components/ui/toast";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "AI-Driven Trading Journal Application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <SupabaseProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar session={session} />
              <main className="flex-1">{children}</main>
            </div>
            <ToastEventListener />
          </ToastProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
