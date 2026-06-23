"use client"

import * as React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel"
import Quiz, { Question } from "./quiz"
import { Separator } from "@/components/ui/separator"
import AppleActivityCard, { ActivityData } from "./quiz-result"
import { VscDebugRestart } from "react-icons/vsc"
import { upsertQuizProgress, clearQuizProgress } from "@/actions/quiz-progress-actions"

interface QuizCarouselProps {
  quizzes: any[];
  quizId?: string | null;
  initialProgress?: any;
}

export function QuizCarousel({ quizzes = [], quizId, initialProgress }: QuizCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  
  const [attempts, setAttempts] = React.useState<Record<string, { isCorrect: boolean, selectedOptionId: string }>>(() => {
    return initialProgress?.attempts ? initialProgress.attempts : {}
  })
  const [showResult, setShowResult] = React.useState(() => initialProgress?.is_completed || false)
  const [resetKey, setResetKey] = React.useState(0)

  const parsedQuestions: Question[] = React.useMemo(() => {
    return quizzes.map((q, i) => ({
      id: `q-${i + 1}`,
      number: i + 1,
      question: q.question,
      options: q.options?.map((opt: any) => ({
        id: `opt-${opt.optionIndex}`,
        label: `Option ${['A','B','C','D'][opt.optionIndex - 1] || opt.optionIndex}`,
        description: opt.option
      })) || [],
      explanation: q.explanation || "No explanation provided.",
      correctOptionId: `opt-${q.correctOption}`
    }));
  }, [quizzes]);

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const handleAttempt = React.useCallback((questionId: string, isCorrect: boolean, selectedOptionId: string) => {
    const patch = { [questionId]: { isCorrect, selectedOptionId } };
    
    setAttempts(prev => ({ ...prev, ...patch }));
    
    if (quizId) {
      upsertQuizProgress(quizId, { ...attempts, ...patch }).catch(console.error);
    }
  }, [attempts, quizId]);

  const handleRestart = React.useCallback(async () => {
    setAttempts({});
    setShowResult(false);
    api?.scrollTo(0);
    setResetKey(prev => prev + 1);
    if (quizId) {
      await clearQuizProgress(quizId).catch(console.error);
    }
  }, [api, quizId]);

  if (!quizzes || quizzes.length === 0) {
    return <div className="text-center p-8 mt-10">No questions available</div>;
  }

  const totalAttempted = Object.keys(attempts).length;
  const totalCorrect = Object.values(attempts).filter(a => a.isCorrect).length;
  const totalQuestions = parsedQuestions.length;

  const activities: ActivityData[] = [
    {
      label: "YourScore",
      value: totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100),
      color: "#63cc3d",
      size: 200,
      current: totalCorrect,
      target: totalQuestions,
      unit: "",
    },
    {
      label: "TotalAttempt",
      value: totalQuestions === 0 ? 0 : Math.round((totalAttempted / totalQuestions) * 100),
      color: "#A3F900",
      size: 160,
      current: totalAttempted,
      target: totalQuestions,
      unit: "",
    },
    {
      label: "Accuracy",
      value: totalAttempted === 0 ? 0 : Math.round((totalCorrect / totalAttempted) * 100),
      color: "#04C7DD",
      size: 120,
      current: totalCorrect,
      target: totalAttempted,
      unit: "",
    },
  ];

  if (showResult) {
    return (
      <div className="w-full max-w-4xl mx-auto border rounded-xl bg-background shadow-xs overflow-hidden">
        <div className="bg-muted px-5 py-2 flex justify-between items-center">
          <h1 className="text-lg font-medium">Result</h1>
          <button 
            onClick={handleRestart} 
            className="text-xs flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <VscDebugRestart />Restart Quiz
          </button>
        </div>
        <div className="p-5 flex justify-center">
          <AppleActivityCard activities={activities} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl border rounded-sm md:rounded-xl bg-background shadow-xs overflow-auto">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {parsedQuestions.map((q) => (
            <CarouselItem key={q.id}>
              {/* the Quiz component has styling that looks like the card content */}
              <Quiz 
                key={`${resetKey}-${q.id}`}
                question={q} 
                initialSelectedOptionId={attempts[q.id]?.selectedOptionId || null}
                onAttempt={(isCorrect, selectedOptionId) => handleAttempt(q.id, isCorrect, selectedOptionId)}
                onRestart={handleRestart}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Footer Navigation */}
      <Separator />
      <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-4 bg-background">
        <div className="text-sm font-medium text-foreground">
          {current}/{count}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => api?.scrollPrev()}
            disabled={!api?.canScrollPrev()}
            className="text-xs md:text-sm font-semibold text-foreground hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
             &lt; Previous
          </button>
          <button
            onClick={() => {
              if (current === count) {
                setShowResult(true);
                if (quizId) {
                  const totalAtt = Object.keys(attempts).length;
                  const totalCorr = Object.values(attempts).filter(a => a.isCorrect).length;
                  upsertQuizProgress(quizId, attempts, true, { totalQuestions: parsedQuestions.length, totalAttempted: totalAtt, totalCorrect: totalCorr }).catch(console.error);
                }
              } else {
                api?.scrollNext();
              }
            }}
            className="text-xs md:text-sm font-semibold text-foreground hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {current === count ? "Submit >" : "Next >"}
          </button>
        </div>
      </div>
    </div>
  )
}

