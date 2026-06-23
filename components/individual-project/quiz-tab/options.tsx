"use client";

import { cn } from "@/lib/utils";
import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemDescription,
} from "@/components/kibo-ui/choicebox";

export interface Option {
  id: string;
  label: string;
  description: string;
}

interface QuizOptionsProps {
  options: Option[];
  correctOptionId: string;
  selectedOptionId: string | null;
  onSelect: (id: string) => void;
}

const QuizOptionsItIs = ({ options, correctOptionId, selectedOptionId, onSelect }: QuizOptionsProps) => {
  return (
    <>
      <Choicebox
        value={selectedOptionId || ""}
        onValueChange={(val: string) => {
          if (!selectedOptionId) {
            onSelect(val);
          }
        }}
      >
        {options.map((option) => {
          let stateClass = "";
          
          if (selectedOptionId) {
            if (option.id === correctOptionId) {
              stateClass = "border-green-500 bg-green-500/10 dark:bg-green-500/20";
            } else if (option.id === selectedOptionId && option.id !== correctOptionId) {
              stateClass = "border-red-500 bg-red-500/10 dark:bg-red-500/20";
            }
          }

          return (
            <ChoiceboxItem
              className={cn(
                "rounded-sm! md:rounded-lg! border-dashed! flex justify-start items-start text-left transition-colors duration-200",
                stateClass,
                selectedOptionId && "cursor-default"
              )}
              key={option.id}
              value={option.id}
            >
              <div className="flex items-start gap-3 w-full">
                <ChoiceboxIndicator className="mt-1 shrink-0" />

                <div className="flex flex-col">
                  <ChoiceboxItemDescription className={cn(
                    selectedOptionId && option.id === correctOptionId && "text-green-700 dark:text-green-300",
                    selectedOptionId && option.id === selectedOptionId && option.id !== correctOptionId && "text-red-700 dark:text-red-300"
                  )}>
                    {option.description}
                  </ChoiceboxItemDescription>
                </div>
              </div>
            </ChoiceboxItem>
          )
        })}
      </Choicebox>
    </>
  );
};

export default QuizOptionsItIs;
