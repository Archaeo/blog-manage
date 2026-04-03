import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  siteName: string;
  navigation?: { label: string; href: string }[];
  children: React.ReactNode;
}

export function Layout({ siteName, navigation, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} navigation={navigation} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
      <Footer siteName={siteName} />
    </div>
  );
}
