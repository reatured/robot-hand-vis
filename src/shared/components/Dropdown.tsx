'use client'

/**
 * Dropdown Component
 * Reusable select dropdown
 */

interface DropdownProps {
  label?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}

export function Dropdown({ label, value, options, onChange, className = '' }: DropdownProps) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-400 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500 hover:border-gray-500 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
