interface RewardAnalysisProps {
  analysis: string;
}

export function RewardAnalysis({ analysis }: RewardAnalysisProps) {
  return (
    <div className="mt-1 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
      💡 <strong>가치 분석:</strong> {analysis}
    </div>
  );
}
