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
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-bold text-slate-700">{title}</h2>
      <div className="space-y-2">
        {codes.map((code) => (
          <div
            key={code.code}
            className={`rounded-xl border bg-white p-3.5 shadow-sm ${
              showExpired
                ? "border-slate-100 opacity-60"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <code className="rounded bg-blue-50 px-2 py-0.5 font-mono text-sm font-bold text-blue-600">
                {code.code}
              </code>
              <VerificationBadge level={code.verified} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{code.reward}</p>
            {code.rewardAnalysis && !showExpired && (
              <RewardAnalysis analysis={code.rewardAnalysis} />
            )}
            <p className="mt-2 text-[10px] text-slate-300">
              추가일: {code.addedDate}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
