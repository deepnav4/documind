"use client";

import {useUploadThing} from "@/utils/uploadthing";
import {UploadFormInputPDF} from "./uploadforminput";
import {toast} from "sonner";
import {FormEvent, useRef, useState} from "react";
import LimitCountBar from "../summaries/limit-count-bar";
import {upload_file_schema} from "@/types/upload-file-type";
import {processChatUpload} from "@/utils/process-chat";

import { IconUpload, IconFileText, IconBoxModel2, IconDatabase } from '@tabler/icons-react';
import { UploadStepper, StepperStep } from "./stepper";
import { deleteFileByKey, saveFeatureDocumentWithChunks } from "@/actions/upload-actions";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Separator } from "../ui/separator";
import FeatureCounter from "../individual-project/counter";
import { generateQuizSet } from "@/utils/quiz-pipeline";

export default function UploadForm({initialCount}: {initialCount: number}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const intentRef = useRef<string>("1"); 
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showCounter, setShowCounter] = useState(false);
  const [generationLimits, setGenerationLimits] = useState({ min: 0, max: 0, val: 0 });
  const [fetchedChunks, setFetchedChunks] = useState<any[]>([]);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);

  const stepsForChat: StepperStep[] = [
    { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
    { title: "Extracting Text", icon: <IconFileText className="size-4" />, content: "Extracting and analyzing text structure..." },
    { title: "Vectorizing", icon: <IconBoxModel2 className="size-4" />, content: "Generating vector embeddings for context..." },
    { title: "Saving Project", icon: <IconDatabase className="size-4" />, content: "Saving document to the knowledge base..." },
  ];

  const stepsForOther: StepperStep[] = [
    { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
    { title: "Processing Route", icon: <IconFileText className="size-4" />, content: "Processing your request for selected route..." },
  ];

  const stepsForGeneration: StepperStep[] = [
    { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
    { title: "Extracting Text", icon: <IconFileText className="size-4" />, content: "Extracting and analyzing text structure..." },
    { title: "Generating Content", icon: <IconBoxModel2 className="size-4" />, content: "Generating content using AI..." },
    { title: "Saving Project", icon: <IconDatabase className="size-4" />, content: "Saving document to the knowledge base..." },
  ];

  const stepsForMindMap: StepperStep[] = [
    { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
    { title: "Analyzing Document", icon: <IconFileText className="size-4" />, content: "Checking document size and format..." },
    { title: "Generating Mind Map", icon: <IconBoxModel2 className="size-4" />, content: "Synthesizing global mind map..." },
    { title: "Saving Project", icon: <IconDatabase className="size-4" />, content: "Saving map to the knowledge base..." },
  ];

  const currentSteps = intentRef.current === "1" ? stepsForChat : (intentRef.current === "2" || intentRef.current === "3") ? stepsForGeneration : intentRef.current === "4" ? stepsForMindMap : stepsForOther;

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setCurrentStep(0);
    setShowCounter(false);
    toast.error("Process completely aborted by user.");
  };

  const handleContinueGeneration = async () => {
      setShowCounter(false);
      setCurrentStep(3); // Generating Content

      const isFlashcards = intentRef.current === "2";
      const endpoint = isFlashcards ? "/api/generate-flash-cards-summary" : "/api/generate-quiz";
      
      try {
          let combinedResult: any[] = [];

          if (isFlashcards) {
              const batchSize = 7;

              for (let i = 0; i < fetchedChunks.length; i += batchSize) {
                  if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");

                  const batch = fetchedChunks.slice(i, i + batchSize);
                  const text = batch.map((c: any) => c.text).join("\n");

                  const batchTargetCount = Math.ceil(generationLimits.val / Math.ceil(fetchedChunks.length / batchSize));

                  const res = await fetch(endpoint, {
                      method: "POST",
                      body: JSON.stringify({ text, targetCount: batchTargetCount }),
                      signal: abortControllerRef.current?.signal
                  });

                  const data = await res.json();

                  if (!res.ok || !data.success) {
                      throw new Error(data.error || data.message || "Flash card generation failed.");
                  }

                  if (data.success && Array.isArray(data.result) && data.result.length > 0) {
                      // Stamp each card with the real page numbers of the chunks in
                      // this batch, so "Source" reflects actual document pages.
                      const batchPages = Array.from(
                          new Set(
                              batch.flatMap(
                                  (c: any) => (c?.meta?.page_numbers ?? c?.metadata?.page_numbers ?? []) as number[]
                              )
                          )
                      ).sort((a, b) => a - b);
                      const stamped = data.result.map((card: any) => ({ ...card, source: batchPages }));
                      combinedResult = [...combinedResult, ...stamped];
                  }
              }
          } else {
              // Quiz: document-wide, quality-first pipeline (first quiz, so no
              // pages are covered yet).
              combinedResult = await generateQuizSet({
                  chunks: fetchedChunks,
                  coveredPages: [],
                  count: generationLimits.val,
                  signal: abortControllerRef.current?.signal,
              });
          }

          if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");

          if (combinedResult.length === 0) {
              throw new Error(`No ${isFlashcards ? "flash cards" : "quiz questions"} were generated.`);
          }
          
          setCurrentStep(4); // Saving Project
          console.log("Combined generated content: ", combinedResult);

          const saveResult = await saveFeatureDocumentWithChunks({
              original_file_url: uploadedFileData.ufsUrl,
              file_name: uploadedFileData.name,
              file_key: uploadedFileData.key,
              file_size: String(uploadedFileData.size),
              chunks: fetchedChunks,
              feature_type: isFlashcards ? "flash-cards" : "quiz",
              generated_data: combinedResult,
              title: `${uploadedFileData.name} - ${isFlashcards ? 'Flash Cards' : 'Quiz'}`
          });
          
          if (!saveResult.success) {
              throw new Error(saveResult.message);
          }
          
          toast.success(`${isFlashcards ? 'Flash Cards' : 'Quiz'} generated successfully!`);
          router.push(`/dashboard/${saveResult.document_id}?tab=${isFlashcards ? 'flash-cards' : 'quiz'}`);
          
      } catch (error: any) {
          if (abortControllerRef.current?.signal.aborted || error.message === "AbortError" || error.name === "AbortError") {
              if (uploadedFileData) await deleteFileByKey(uploadedFileData.key);
          } else {
              toast.error(error.message || "Generation failed!");
          }
      } finally {
          setCurrentStep(0);
          setLoading(false);
      }
  };

  const {startUpload} = useUploadThing("pdfUploader", {
    onClientUploadComplete: async (res) => {
      try {
        if (abortControllerRef.current?.signal.aborted) {
            await deleteFileByKey(res[0].key);
            return;
        }

        const intent = intentRef.current;
        
        if (intent === "1") {
            const result = await processChatUpload(
              res[0], 
              (step) => setCurrentStep(step),
              abortControllerRef.current?.signal
            );
            if (result.success) {
              toast.success("Document perfectly saved for Chat!");
              router.push(`/dashboard/${result.document_id}?tab=chat`);
            } else {
              toast.error(result.message);
            }
        } else if (intent === "2" || intent === "3") {
            setCurrentStep(2);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
                const pythonApiUrl = `${baseUrl}/get-chunks?source=${res[0].ufsUrl}`;
                const fileText = await fetch(pythonApiUrl, { signal: abortControllerRef.current?.signal });
                const fileJson = await fileText.json();
                const chunks = fileJson.chunks;
                
                if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");
                
                setFetchedChunks(chunks);
                setUploadedFileData(res[0]);
                
                const isFlashcards = intent === "2";
                const length = chunks.length;
                
                let minItems = isFlashcards ? Math.max(10, Math.min(10, length)) : Math.max(5, Math.min(5, length));
                let maxItems = isFlashcards ? Math.min(50, Math.max(length * 2, minItems + 5)) : Math.min(25, Math.max(length, minItems + 3));
                
                setGenerationLimits({ min: minItems, max: maxItems, val: minItems });
                setShowCounter(true);
            } catch (error: any) {
                if (abortControllerRef.current?.signal.aborted || error.message === "AbortError" || error.name === "AbortError") {
                    await deleteFileByKey(res[0].key);
                } else {
                    toast.error("Failed to extract text from document!");
                    setCurrentStep(0);
                    setLoading(false);
                }
            }
        } else if (intent === "4") {
            setCurrentStep(1); // Analyzing Document
            try {
                const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
                const pythonApiUrl = `${baseUrl}/process-document?source=${res[0].ufsUrl}`;
                const resApi = await fetch(pythonApiUrl, { signal: abortControllerRef.current?.signal });
                const jsonApi = await resApi.json();
                
                if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");
                
                let chunks: any[] = [];
                let finalContextString = "";

                if (jsonApi.doc_type === "markdown") {
                  finalContextString = jsonApi.data;
                } else if (jsonApi.doc_type === "chunks") {
                  chunks = jsonApi.data || [];
                  
                  const batchSize = 10;
                  let combinedSummaries = "";
                  for (let i = 0; i < chunks.length; i += batchSize) {
                      if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");
                      const batch = chunks.slice(i, i + batchSize);
                      const text = batch.map((c: any) => c.text).join("\\n");
                      
                      const summaryRes = await fetch("/api/mind-map", {
                          method: "POST",
                          body: JSON.stringify({ pdfFile: text, phase: "map" }),
                          signal: abortControllerRef.current?.signal
                      });
                      const summaryData = await summaryRes.json();
                      if (summaryData.success) {
                         combinedSummaries += summaryData.summary + "\\n\\n";
                      }
                  }
                  finalContextString = combinedSummaries;
                }

                if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");
                setCurrentStep(2); // Generating Mind Map

                const generateRes = await fetch("/api/mind-map", {
                    method: "POST",
                    body: JSON.stringify({ pdfFile: finalContextString }),
                    signal: abortControllerRef.current?.signal
                });
                const generateData = await generateRes.json();
                if (!generateData.success) throw new Error("Failed to synthesize mind map");

                const finalMindMap = generateData.result;

                if (abortControllerRef.current?.signal.aborted) throw new Error("AbortError");
                setCurrentStep(3); // Saving Project
                
                const saveResult = await saveFeatureDocumentWithChunks({
                    original_file_url: res[0].ufsUrl,
                    file_name: res[0].name,
                    file_key: res[0].key,
                    file_size: String(res[0].size),
                    chunks: chunks,
                    feature_type: "mind-map",
                    generated_data: finalMindMap,
                    title: `${res[0].name} - Mind Map`
                });
                
                if (!saveResult.success) {
                    throw new Error(saveResult.message);
                }
                
                toast.success("Mind Map generated successfully!");
                router.push(`/dashboard/${saveResult.document_id}?tab=mind-map`);
            } catch (error: any) {
                if (abortControllerRef.current?.signal.aborted || error.message === "AbortError" || error.name === "AbortError") {
                    await deleteFileByKey(res[0].key);
                } else {
                    toast.error("Failed to generate mind map!");
                    setCurrentStep(0);
                    setLoading(false);
                }
            }
        }
        
      } catch (error: any) {
        if (abortControllerRef.current?.signal.aborted || error.message === "AbortError" || error.name === "AbortError") {
            // Already handled via handleCancel, but we must delete the file
            await deleteFileByKey(res[0].key);
        } else {
            toast.error("Failed to process document!");
        }
      } finally {
        if (intentRef.current !== "2" && intentRef.current !== "3" && intentRef.current !== "4") {
          setLoading(false);
          setCurrentStep(0);
        }
      }
    },
    onUploadError: (e) => {
      setLoading(false);
      setCurrentStep(0);
      toast.error("Upload error!");
    }
  });

  const handlPDF = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      abortControllerRef.current = new AbortController();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;
      
      const intent = formData.get("intent") as string;
      intentRef.current = intent;
      
      const validatedFiles = upload_file_schema.safeParse({file});

      if (!validatedFiles.success) {
        toast("File validation failed");
        setLoading(false);
        return;
      }

      setCurrentStep(1); // Start stepper

      const uploadFile = await startUpload([file]);

      if (!uploadFile) {
        if (!abortControllerRef.current?.signal.aborted) {
          toast("Something during file upload went wrong");
        }
        setCurrentStep(0);
        setLoading(false);
        return;
      }

      console.log("uploadedFileInfo : ", uploadFile[0].key);
      formRef.current?.reset();
    } catch {
      setLoading(false);
      setCurrentStep(0);
      console.error(
        "something went wrong while uploading the file to uploadThings",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto my-2 text-center items-center justify-center">
      {currentStep > 0 ? (
        <div className="w-full py-12">
          <Button onClick={handleCancel} variant="outline" className="rounded-xs md:rounded-md flex gap-2 justify-self-start"> <ArrowLeft /> Back</Button>
            <Separator className="mb-10 mt-4" />
            {showCounter ? (
               <div className="flex flex-col items-center justify-center gap-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">How many {intentRef.current === "2" ? "Flash Cards" : "Quizzes"} do you want to generate?</h3>
                  <FeatureCounter 
                    min={generationLimits.min} 
                    max={generationLimits.max} 
                    step={1} 
                    defaultValue={generationLimits.val} 
                    onChange={(val) => setGenerationLimits(prev => ({...prev, val}))}
                  />
                  <Button onClick={handleContinueGeneration} className="mt-8 px-8" size="lg">Continue</Button>
               </div>
            ) : (
               <UploadStepper steps={currentSteps} currentStep={currentStep} onCancel={handleCancel} />
            )}
        </div>
      ) : initialCount <= 5 ? (
        <UploadFormInputPDF
          isLoading={loading}
          ref={formRef}
          onsubmit={handlPDF}
        />
      ) : (
        <LimitCountBar />
      )}
    </div>
  );
}
