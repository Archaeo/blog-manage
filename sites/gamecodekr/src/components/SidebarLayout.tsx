"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // 경로 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden w-[230px] flex-shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar currentPath={pathname} />
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 h-full w-[260px] shadow-lg">
            <Sidebar
              currentPath={pathname}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* 메인 영역 */}
      <div className="flex flex-1 flex-col">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
