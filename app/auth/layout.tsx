import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Trading Journal",
  description: "Sign in or create an account for the Trading Journal",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">
      {children}
    </div>
  );
}
