import React from "react";

interface FooterProps {
  siteName: string;
}

export function Footer({ siteName }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p className="mt-1">이 사이트는 로블록스(Roblox)와 공식적인 관련이 없습니다.</p>
      </div>
    </footer>
  );
}
