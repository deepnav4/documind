"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {PlusIcon, ArrowLeftIcon} from "lucide-react";
import {Button} from "../../ui/button";
import {Separator} from "../../ui/separator";
import {SiQuizlet} from "react-icons/si";
import {EmptyState} from "../empty-state";
import {QuizList} from "./quiz-list";
import {QuizCarousel} from "./quiz-carousel";

import { UploadStepper, StepperStep } from "@/components/upload/stepper";
import { IconUpload, IconFileText, IconBoxModel2, IconDatabase } from '@tabler/icons-react';
import FeatureCounter from "../counter";
import { getDocumentChunksRaw, addGeneratedContentToExistingDocument } from "@/actions/upload-actions";
import { toast } from "sonner";
import LimitReachBanner from "../limit-reach-banner";
import TabsHeader from "../tabs-header";
import { generateQuizSet, coveredPagesFromQuizzes } from "@/utils/quiz-pipeline";

type TQuizTabProps = {
  quizzes: any[];
  documentContextForChat?: any;
};

const stepsForGeneration: StepperStep[] = [
  { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
  { title: "Extracting Text", icon: <IconFileText className="size-4" />, content: "Extracting and analyzing text structure..." },
  { title: "Generating Content", icon: <IconBoxModel2 className="size-4" />, content: "Generating content using AI..." },
  { title: "Saving Project", icon: <IconDatabase className="size-4" />, content: "Saving document to the knowledge base..." },
];

export function QuizTab({quizzes, documentContextForChat}: TQuizTabProps) {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const router = useRouter();

  const [localQuizzes, setLocalQuizzes] = useState<any[]>(quizzes);

  useEffect(() => {
    setLocalQuizzes(quizzes);
  }, [quizzes]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [generationLimits, setGenerationLimits] = useState({ min: 0, max: 0, val: 0 });
  const [fetchedChunks, setFetchedChunks] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showLimitBanner, setShowLimitBanner] = useState<boolean>(false);

  const handleQuizSelect = (id: string) => {
    setSelectedQuizId(id);
    setView('detail');
  };

  const listItems = localQuizzes.map(quiz => {
    const progress = quiz.progress?.[0];
    const attempted = progress && progress.attempts && Object.keys(progress.attempts).length > 0;
    
    let score;
    if (progress?.scores && typeof progress.scores === 'object') {
      score = Number((progress.scores as any).totalCorrect) || 0;
    }

    return {
      id: quiz.id,
      title: quiz.title || "Generated Quiz",
      date: new Date(quiz.created_at || Date.now()).toLocaleDateString(),
      attempted: !!attempted,
      score: score,
      total: Array.isArray(quiz.data) ? quiz.data.length : 0
    };
  });

  const selectedQuiz = localQuizzes.find(q => q.id === selectedQuizId);
  const selectedData = selectedQuiz?.data || [];
  const initialProgress = selectedQuiz?.progress?.[0];

  const handleBackToList = () => {
    setView('list');
    router.refresh();
  };

  const handleStartGeneration = async () => {
    if (!documentContextForChat?.id || !documentContextForChat?.url) return;

    if(localQuizzes.length >= 5) {
      setShowLimitBanner(true);
      return;
    }
    setShowLimitBanner(false);
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setCurrentStep(1); // Upload
      await new Promise(r => setTimeout(r, 800));
      if (signal.aborted) throw new Error("AbortError"); 

      setCurrentStep(2); // Extracting - I think I will change the way this i.e not the numbers and defining an enum
      let chunks: any[] = [];
      const hasChunks = documentContextForChat.totalChunks > 0;

      if (hasChunks) {
         const res = await getDocumentChunksRaw(documentContextForChat.id);
         if (!res.success) throw new Error(res.message);
         chunks = (res.chunks || []) as any[];
      } else {
         const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
         const pythonApiUrl = `${baseUrl}/get-chunks?source=${documentContextForChat.url}`;
         const fileText = await fetch(pythonApiUrl, { signal });
         const fileJson = await fileText.json();
         if (signal.aborted) throw new Error("AbortError");
         chunks = fileJson.chunks;
      }

      setFetchedChunks(chunks);
      const length = chunks.length;
      let minItems = Math.max(10, Math.min(10, length));
      let maxItems = Math.min(50, Math.max(length * 2, minItems + 5));
      setGenerationLimits({ min: minItems, max: maxItems, val: minItems });
      
      setShowCounter(true);
    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "AbortError") {
          toast.error("User aborted setup process.");
      } else {
          toast.error(error.message || "Something went wrong.");
      }
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const handleContinueGeneration = async () => {
    setShowCounter(false);
    setCurrentStep(3); // Generating Content - I will think more about this later.
    const signal = abortControllerRef.current?.signal;

    try {
      // Document-wide, quality-first quiz: stratified across the whole document,
      // skipping pages already covered by previous quiz sets, no padding.
      const coveredPages = coveredPagesFromQuizzes(localQuizzes);
      const combinedResult = await generateQuizSet({
        chunks: fetchedChunks,
        coveredPages,
        count: generationLimits.val,
        signal,
      });

      if (signal?.aborted) throw new Error("AbortError");

      if (combinedResult.length === 0) {
        throw new Error("Couldn't generate good quiz questions from this document right now. Please try again.");
      }
      
      setCurrentStep(4); // Saving Project - This again is confusing a bit I know, but I will correct it later.
      const hasChunks = documentContextForChat.totalChunks > 0;
      
      const saveRes = await addGeneratedContentToExistingDocument(
        documentContextForChat.id,
        "quiz",
        combinedResult,
        `${documentContextForChat.name} - Quiz`,
        !hasChunks ? fetchedChunks : undefined
      );

      if (!saveRes.success) throw new Error(saveRes.message);
      
      const newlyGeneratedSet = {
        id: crypto.randomUUID(), 
        title: `${documentContextForChat.name} - Quiz`,
        created_at: new Date().toISOString(),
        data: combinedResult
      };

      setLocalQuizzes(prev => [newlyGeneratedSet, ...prev]);
      
      toast.success("Quiz generated successfully!");
      setIsGenerating(false);
      setCurrentStep(0);
      router.refresh();

    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "AbortError") {
          toast.error("User aborted setup process.");
      } else {
          toast.error(error.message || "Generation failed!");
      }
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setCurrentStep(0);
    setShowCounter(false);
  };

  if (isGenerating) {
    return (
       <div className="flex-1 flex w-full h-full justify-center items-center px-2 py-10 max-w-4xl mx-auto flex-col gap-4">
           {showCounter ? (
             <div className="flex flex-col items-center justify-center gap-2.5 md:gap-6 mt-4 md:mt-8 w-full max-w-lg">
                <h3 className="text-base md:text-xl font-medium md:font-semibold mb-2.5 md:mb-4 text-center">How many Quiz questions do you want to generate?</h3>
                <FeatureCounter 
                  min={generationLimits.min} 
                  max={generationLimits.max} 
                  step={1} 
                  defaultValue={generationLimits.val} 
                  onChange={(val) => setGenerationLimits(prev => ({...prev, val}))}
                />
                <Button onClick={handleContinueGeneration} className="mt-4 md:mt-8 px-8 w-full rounded-xs md:rounded-md" size="lg">Continue</Button>
                <Button onClick={handleCancel} variant="outline" className="mt-2 w-full rounded-xs md:rounded-md">Cancel</Button>
             </div>
           ) : (
             <UploadStepper steps={stepsForGeneration} currentStep={currentStep} onCancel={handleCancel} />
           )}
       </div>
    );
  }

  if (view === 'detail') {
    return (
      <div className="min-w-full">
         <div className="max-w-full flex justify-start items-center px-2.5 md:px-6 mt-1 bg-blue-300/10 rounded-none md:rounded-lg p-2.5 md:p-4 mx-1.5 md:mx-5 shadow-xs">
           <Button variant="outline" size="xs" className="rounded-xs md:rounded-2xl shadow-md" onClick={handleBackToList}>
             <ArrowLeftIcon className="size-4"/> Back 
           </Button>
         </div>
         <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
         <QuizCarousel quizzes={selectedData} quizId={selectedQuizId} initialProgress={initialProgress} />
      </div>
    );
  }

  return (
    <>
      {localQuizzes.length === 0 ? (
        <EmptyState
          icon={<SiQuizlet className="text-blue-500" />}
          title="No Quizzes"
          description="You have no quizzes yet. Create Your first Quiz."
          buttonText="Create Quiz"
          executeOnClick={handleStartGeneration}
        />
      ) : (
        <div className="min-w-full">
          {/* <div className="max-w-full flex justify-between items-center px-6 mt-1 bg-blue-300/10 rounded-lg p-4 mx-5">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-lg shadow-md">
                <SiQuizlet className="size-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Quizzes are fun !!</span>
            </div>
            <div>
              <Button
                size={"xs"}
                variant={"outline"}
                className="rounded-full shadow-md"
                onClick={handleStartGeneration}
              >
                <PlusIcon /> Generate More
              </Button>
            </div>
          </div> */}
          <TabsHeader
            Icon={SiQuizlet}
            title="Quizzes are fun!!"
            command="Generate More"
            onClick={handleStartGeneration}
          />
          {localQuizzes.length >= 5 && showLimitBanner && <div className="max-w-full flex justify-between items-center px-2.5 md:px-6 rounded-xs md:rounded-lg pt-2"><LimitReachBanner limitMessage="At once you can create max. 5 quiz for each project." /></div>}
          <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
          <QuizList 
            initialItems={listItems} 
            onQuizSelect={handleQuizSelect} 
            onDeleteQuiz={(id) => {
              setLocalQuizzes(prev => prev.filter(q => q.id !== id));
              router.refresh();
            }}
          />
        </div>
      )}
    </>
  );
}
