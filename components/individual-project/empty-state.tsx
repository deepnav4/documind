"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { IconFolder, IconPlus } from '@tabler/icons-react'

type EmptyStateProps = {
    title: string;
    description: string;
    buttonText: string;
    executeOnClick: () => void;
    icon: React.ReactNode;
}

export function EmptyState({title, description, buttonText, executeOnClick, icon}: EmptyStateProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Empty className="dark:shadow-zinc-900">
        <EmptyHeader>
          <EmptyMedia className="rounded-none md:rounded-lg" variant="icon">
            {icon}
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            {description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button className="rounded-none md:rounded-md" variant="outline" onClick={executeOnClick}>
            <IconPlus  data-icon="inline-start" />
            {buttonText}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
