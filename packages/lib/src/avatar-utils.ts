// Utility functions for generating consistent user avatars

// Function to generate consistent colors based on name
export const generateAvatarColors = (name: string) => {
  // Create a hash from the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Define color combinations (background, text)
  const colorCombinations = [
    { bg: "bg-blue-500", text: "text-white", hex: "#3b82f6" },
    { bg: "bg-green-500", text: "text-white", hex: "#22c55e" },
    { bg: "bg-purple-500", text: "text-white", hex: "#a855f7" },
    { bg: "bg-pink-500", text: "text-white", hex: "#ec4899" },
    { bg: "bg-indigo-500", text: "text-white", hex: "#6366f1" },
    { bg: "bg-red-500", text: "text-white", hex: "#ef4444" },
    { bg: "bg-orange-500", text: "text-white", hex: "#f97316" },
    { bg: "bg-teal-500", text: "text-white", hex: "#14b8a6" },
    { bg: "bg-cyan-500", text: "text-white", hex: "#06b6d4" },
    { bg: "bg-emerald-500", text: "text-white", hex: "#10b981" },
    { bg: "bg-violet-500", text: "text-white", hex: "#8b5cf6" },
    { bg: "bg-rose-500", text: "text-white", hex: "#f43f5e" },
    { bg: "bg-amber-500", text: "text-white", hex: "#f59e0b" },
    { bg: "bg-lime-500", text: "text-white", hex: "#84cc16" },
    { bg: "bg-sky-500", text: "text-white", hex: "#0ea5e9" },
  ]

  // Use absolute value of hash to get positive index
  const index = Math.abs(hash) % colorCombinations.length
  return colorCombinations[index]
}

// Function to get initials from name
export const getInitials = (name: string) => {
  if (!name || name.trim() === "") return "U"
  
  return name
    .trim()
    .split(" ")
    .filter(n => n.length > 0) // Remove empty strings
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) // Take only first 2 initials
}

// Function to generate a consistent hash from a string (useful for consistent colors)
export const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}