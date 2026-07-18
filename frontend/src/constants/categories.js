export const CATEGORY_META = {
  food: { label: "Food", icon: "🍔", color: "bg-orange-100 text-orange-700" },
  transport: { label: "Transport", icon: "🚗", color: "bg-blue-100 text-blue-700" },
  rent: { label: "Rent", icon: "🏠", color: "bg-purple-100 text-purple-700" },
  utilities: { label: "Utilities", icon: "💡", color: "bg-yellow-100 text-yellow-700" },
  shopping: { label: "Shopping", icon: "🛍️", color: "bg-pink-100 text-pink-700" },
  partying: { label: "Partying", icon: "🎉", color: "bg-fuchsia-100 text-fuchsia-700" },
  investment: { label: "Investment", icon: "📈", color: "bg-emerald-100 text-emerald-700" },
  health: { label: "Health", icon: "💊", color: "bg-red-100 text-red-700" },
  entertainment: { label: "Entertainment", icon: "🎬", color: "bg-indigo-100 text-indigo-700" },
  education: { label: "Education", icon: "📚", color: "bg-cyan-100 text-cyan-700" },
  salary: { label: "Salary", icon: "💰", color: "bg-green-100 text-green-700" },
  freelance: { label: "Freelance", icon: "💼", color: "bg-teal-100 text-teal-700" },
  investment_return: { label: "Returns", icon: "📊", color: "bg-lime-100 text-lime-700" },
  gift: { label: "Gift", icon: "🎁", color: "bg-rose-100 text-rose-700" },
  other: { label: "Other", icon: "📌", color: "bg-gray-100 text-gray-700" },
};

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || CATEGORY_META.other;
