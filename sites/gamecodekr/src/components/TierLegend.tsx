export function TierLegend() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <h3 className="mb-2 text-xs font-bold text-slate-600">
        📖 티어표 보는 법
      </h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
        <span>🟢 3개 소스 일치</span>
        <span>🔵 2개 소스 일치</span>
        <span>⚠️ 의견 불일치</span>
        <span>🔺 상승</span>
        <span>🔻 하락</span>
        <span>🆕 신규</span>
      </div>
    </div>
  );
}
