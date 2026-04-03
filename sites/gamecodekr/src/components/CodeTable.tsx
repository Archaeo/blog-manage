import { VerificationBadge } from "@blog-manage/shared-ui";
import { RewardAnalysis } from "./RewardAnalysis";
import type { GameCode } from "@/lib/types";

interface CodeTableProps {
  codes: GameCode[];
  title: string;
  showExpired?: boolean;
}

export function CodeTable({ codes, title, showExpired = false }: CodeTableProps) {
  if (codes.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="space-y-4">
        {codes.map((code) => (
          <div
            key={code.code}
            className={`rounded-lg border p-4 ${
              showExpired
                ? "border-gray-200 bg-gray-50 opacity-60"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-3 py-1 font-mono text-lg font-bold">
                {code.code}
              </code>
              <VerificationBadge level={code.verified} />
            </div>
            <p className="mt-2 text-gray-700">
              🎁 <strong>보상:</strong> {code.reward}
            </p>
            {code.rewardAnalysis && !showExpired && (
              <RewardAnalysis analysis={code.rewardAnalysis} />
            )}
            <p className="mt-2 text-xs text-gray-400">
              추가일: {code.addedDate}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
