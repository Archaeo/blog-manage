interface EditorialSummaryProps {
  summary: string;
}

export function EditorialSummary({ summary }: EditorialSummaryProps) {
  if (!summary) return null;

  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
      <p className="text-sm leading-relaxed text-blue-900">{summary}</p>
    </div>
  );
}
