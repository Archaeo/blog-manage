"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function CodesRedirect({ params }: { params: { game: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.game}/codes/${getCurrentMonth()}`);
  }, [params.game, router]);
  return <p>리다이렉트 중...</p>;
}
