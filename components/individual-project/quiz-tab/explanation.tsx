"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Explanation({ text, attempted }: { text: string, attempted: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      className="flex w-full flex-col gap-2 pt-5"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <CollapsibleTrigger asChild>
       <div className="flex items-center gap-2 cursor-pointer">
        <h4 className="text-sm font-medium">Explanation</h4>
          <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
            <ChevronsUpDown />
            <span className="sr-only">Toggle details</span>
          </Button>
       </div>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="flex flex-col gap-2">
       {!attempted ? (
         <h1 className="text-sm pl-4 text-orange-500 font-medium">Attempt the question first to see the explanation.</h1>
       ) : (
         <h1 className="text-sm pl-4 text-muted-foreground">{text}</h1>
       )}
      </CollapsibleContent>
    </Collapsible>
  )
}
