interface TierAnalysisProps {
  analysis: string;
  recommendation?: string;
  analysisSources?: string[];
  analysisDate?: string;
}

export function TierAnalysis({
  analysis,
  recommendation,
  analysisSources,
  analysisDate,
}: TierAnalysisProps) {
  if (!analysis) return null;

  const paragraphs = analysis.split("\n\n").filter(Boolean);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          📝 종합 분석
        </h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-medium text-slate-500">
          자동 생성
        </span>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-slate-700">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {recommendation && (
        <div className="mt-4 rounded-lg border-l-[3px] border-green-500 bg-green-50 px-3 py-2">
          <p className="text-sm text-green-900">
            <span className="font-bold">🎯 초보자 추천:</span> {recommendation}
          </p>
        </div>
      )}

      {(analysisSources || analysisDate) && (
        <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          {analysisSources && (
            <span>분석 소스: {analysisSources.join(", ")}</span>
          )}
          {analysisSources && analysisDate && <span> · </span>}
          {analysisDate && <span>마지막 종합: {analysisDate}</span>}
        </div>
      )}
    </div>
  );
}
