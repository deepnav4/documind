"use client";

import { useState } from "react";
import {Explanation} from "./explanation";
import QuizOptionsItIs, { Option } from "./options";
import { VscDebugRestart } from "react-icons/vsc";

export interface Question {
  id: string;
  number: number;
  question: string;
  options: Option[];
  explanation: string;
  correctOptionId: string;
}

export default function Quiz({ 
  question, 
  onAttempt, 
  onRestart,
  initialSelectedOptionId = null
}: { 
  question: Question, 
  onAttempt?: (isCorrect: boolean, selectedOptionId: string) => void,
  onRestart?: () => void,
  initialSelectedOptionId?: string | null
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(initialSelectedOptionId);

  return (
    <div className="w-full">
      <div className="bg-muted px-5 py-2 flex justify-between items-center">
        <h1 className="text-lg font-medium">Question {question.number}</h1>
        <button 
          onClick={onRestart} 
          className="text-xs flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <VscDebugRestart />Restart Quiz
        </button>
      </div>
      <div className="p-3 md:p-5">
        <h1 className="pb-3 md:pb-5 font-medium">{question.question}</h1>
        <QuizOptionsItIs 
          options={question.options} 
          correctOptionId={question.correctOptionId}
          selectedOptionId={selectedOptionId}
          onSelect={(id) => {
            if (!selectedOptionId) {
              setSelectedOptionId(id);
              onAttempt?.(id === question.correctOptionId, id);
            }
          }}
        />
        <Explanation text={question.explanation} attempted={selectedOptionId !== null} />
      </div>
    </div>
  );
}
