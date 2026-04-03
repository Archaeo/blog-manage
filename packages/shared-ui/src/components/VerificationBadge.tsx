import React from "react";

interface VerificationBadgeProps {
  level: 1 | 2 | 3;
}

export function VerificationBadge({ level }: VerificationBadgeProps) {
  if (level === 3) {
    return <span title="3개 소스에서 확인됨">✅✅✅</span>;
  }
  if (level === 2) {
    return <span title="2개 소스에서 확인됨">✅✅</span>;
  }
  return <span title="미확인 - 1개 소스만 확인">⚠️</span>;
}
