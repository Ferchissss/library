"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sparkles, FileText } from "lucide-react"

interface BulkInputSectionProps {
  onParse: (bulkData: string) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BulkInputSection({ onParse, isOpen, onOpenChange }: BulkInputSectionProps) {
  const [bulkData, setBulkData] = useState("")

  const handleParse = () => {
    onParse(bulkData)
    setBulkData("") // Clear textarea after parsing
  }

  return (
    <Card className="bg-purple-50/50 bordes">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-v50 transition-colors py-2">
            <CardTitle className="flex items-center gap-2 text text-base">
              <Sparkles className="h-4 w-4" />
              Quick Data Entry
            </CardTitle>
            <CardDescription className="text-sm">
              Paste all data with line breaks to automatically fill in the fields
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2">
            <div className="bg-v100 p-3 rounded-lg">
              <h4 className="font-semibold text mb-2 text-sm">Expected order (one per line):</h4>
              <ol className="text-xs text-v700 grid grid-flow-col grid-rows-12 gap-x-4 gap-y-1">
                <li>1. Book title *</li>
                <li>2. Author *</li>
                <li>3. Genres (comma separated)</li>
                <li>4. Rating (1-10)</li>
                <li>5. Book type</li>
                <li>6. Number of pages</li>
                <li>7. Start date (YYYY-MM-DD)</li>
                <li>8. End date</li>
                <li>9. Publication year</li>
                <li>10. Publisher</li>
                <li>11. Language</li>
                <li>12. Era/Period</li>
                <li>13. Format (Physical/Digital)</li>
                <li>14. Audience (Adult/Young Adult/Children)</li>
                <li>15. Reading density</li>
                <li>16. Awards</li>
                <li>17. Cover URL</li>
                <li>18. Main Characters (comma separated)</li>
                <li>19. Favorite Character</li>
                <li>20. Is favorite (true/false)</li>
                <li>21. Summary</li>
                <li>22. Your opinion</li>
                <li>23. Series/Saga</li>
                <li>24+. Quotes (text|page|category)</li>
              </ol>
            </div>
            <Textarea
              placeholder={`One Hundred Years of Solitude
Gabriel García Márquez
Magical Realism, Novel
9.2
Novel
417
2024-01-15
2024-02-20
1967
Editorial Sudamericana
Spanish
20th Century
Physical
Adult
Dense
Nobel Prize in Literature 1982
/placeholder.svg?height=200&width=150
José Arcadio Buendía, Úrsula Iguarán
Aureliano Babilonia
true
The novel tells the story of the Buendía family...
A masterpiece that transports you to Macondo...
Macondo
Love in the time of cholera is a disease|123|Love
Many years later, facing the firing squad...|1|Philosophy`}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={12}
              className="bordes focus:border-v400 font-mono text-sm"
            />
            <Button
              onClick={handleParse}
              className="w-full button1"
              disabled={!bulkData.trim()}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Fill Fields Automatically
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}