import React from "react";

interface HeaderProps {
  siteName: string;
  navigation?: { label: string; href: string }[];
}

export function Header({ siteName, navigation = [] }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          {siteName}
        </a>
        {navigation.length > 0 && (
          <nav className="flex gap-4">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="text-gray-600 hover:text-gray-900">
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
