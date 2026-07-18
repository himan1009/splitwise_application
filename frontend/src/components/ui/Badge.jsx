import { getCategoryMeta } from "../../constants/categories";

export default function Badge({ category }) {
  const meta = getCategoryMeta(category);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/8 border border-white/10 text-slate-300">
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
