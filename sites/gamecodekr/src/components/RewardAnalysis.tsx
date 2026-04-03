interface RewardAnalysisProps {
  analysis: string;
}

export function RewardAnalysis({ analysis }: RewardAnalysisProps) {
  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      💡 {analysis}
    </div>
  );
}
