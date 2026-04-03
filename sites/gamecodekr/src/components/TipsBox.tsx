interface TipsBoxProps {
  tips: string;
  totalValue?: string;
}

export function TipsBox({ tips, totalValue }: TipsBoxProps) {
  if (!tips) return null;

  return (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <h3 className="mb-1.5 text-xs font-bold text-green-800">
        💡 꿀팁
      </h3>
      <p className="text-sm leading-relaxed text-green-900">{tips}</p>
      {totalValue && (
        <p className="mt-2 text-xs font-semibold text-green-700">
          🎁 총 보상 가치: {totalValue}
        </p>
      )}
    </div>
  );
}
