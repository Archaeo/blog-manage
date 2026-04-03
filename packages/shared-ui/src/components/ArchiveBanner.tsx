import React from "react";

interface ArchiveBannerProps {
  currentMonthUrl: string;
  archiveMonth: string;
}

export function ArchiveBanner({ currentMonthUrl, archiveMonth }: ArchiveBannerProps) {
  return (
    <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm">
      <p>
        📢 이 페이지는 <strong>{archiveMonth}</strong> 아카이브입니다.{" "}
        <a href={currentMonthUrl} className="text-blue-600 underline font-medium">
          최신 페이지 보기 →
        </a>
      </p>
    </div>
  );
}
