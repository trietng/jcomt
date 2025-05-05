"use client"

interface TokenizedTextProps {
  text: string
  selectedToken: string | null
  onTokenClick: (token: string) => void
}

export function TokenizedText({ text, selectedToken, onTokenClick }: TokenizedTextProps) {
  // Process the text to handle newlines and tokenize words
  const paragraphs = text.split("\n").filter((p) => p.trim() !== "")

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="leading-relaxed">
          {paragraph.split(/(\s+)/).map((part, index) => {
            // Skip rendering for whitespace
            if (part.trim() === "") {
              return <span key={`${pIndex}-${index}`}>{part}</span>
            }

            const cleanToken = part.toLowerCase().replace(/[^\w']/g, "")
            const isSelected = selectedToken === cleanToken

            return (
              <span
                key={`${pIndex}-${index}`}
                className={`inline-block cursor-pointer px-0.5 rounded ${
                  isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                }`}
                onClick={() => onTokenClick(part)}
              >
                {part}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
