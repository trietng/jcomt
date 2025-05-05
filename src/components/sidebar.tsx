"use client"
import { Card } from "@/components/ui/card"
import type { Translation } from "@/lib/common/model"
import { TokenizedText } from "./tokenized-text"
import { useEffect, useMemo, useState } from "react"
import { wink } from "@/lib/nlp"
import { getDictionaryDefinition } from "@/lib/dictionary"

interface SidebarProps {
  translations: Translation[] | null;
}

export function Sidebar({ translations }: SidebarProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [definition, setDefinition] = useState<string | null>(null)

  const handleTokenClick = async (token: string) => {
    const cleanToken = token.toLowerCase().replace(/[^\w']/g, "")

    if (selectedToken === cleanToken) {
      setSelectedToken(null)
      setDefinition(null)
    } else {
      try {
        const def = await getDictionaryDefinition(cleanToken)
        setSelectedToken(cleanToken)
        setDefinition(def)
      } catch (_) {
        // suppress error
      }
    }
  }

  const tokenGroups = useMemo(() => {
    if (!translations) return []
    return translations.map((translation) => {
      const doc = wink.readDoc(translation.text.trim());
      return doc.tokens().out();
    })
  }, [translations]);

  useEffect(() => {
    if (!translations) {
      setSelectedToken(null)
      setDefinition(null)
    }
  }, [translations]);

  return (
    <div className="w-80 h-full bg-white shadow-lg overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-4">Dictionary</h2>
      <div className="space-y-4">
        {tokenGroups.map((tokens, tokensIndex) => (
          <Card key={tokensIndex} className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Text #{tokensIndex + 1}</h3>
            
            <div className="flex flex-wrap">
              {tokens.map((token, tokenIndex) => (
                <TokenizedText key={tokenIndex} text={token} selectedToken={selectedToken} onTokenClick={handleTokenClick}/>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {definition && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 sticky bottom-4">
          <h4 className="font-semibold">{selectedToken}</h4>
          <p className="text-sm text-gray-700 mt-1">{definition}</p>
        </div>
      )}
    </div>
  )
}

