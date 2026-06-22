"use client";

import {useState, useRef, useEffect} from "react";
import {TbCardsFilled} from "react-icons/tb";
import {Button} from "../../ui/button";
import {PlusIcon, ArrowLeftIcon} from "lucide-react";
import {Separator} from "../../ui/separator";
import {EmptyState} from "../empty-state";
import {FlashCardsList} from "./flash-cards-list";
import {FlashCardsCarousel} from "./flash_cards_carousel";

import {UploadStepper, StepperStep} from "@/components/upload/stepper";
import {
  IconUpload,
  IconFileText,
  IconBoxModel2,
  IconDatabase,
} from "@tabler/icons-react";
import FeatureCounter from "../counter";
import {
  getDocumentChunksRaw,
  addGeneratedContentToExistingDocument,
} from "@/actions/upload-actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import LimitReachBanner from "../limit-reach-banner";
import TabsHeader from "../tabs-header";

type TFlashCardsTabProps = {
  flashCards: any[];
  documentContextForChat?: any;
};

const stepsForGeneration: StepperStep[] = [
  {
    title: "Uploading File",
    icon: <IconUpload className="size-4" />,
    content: "Uploading your PDF file securely...",
  },
  {
    title: "Extracting Text",
    icon: <IconFileText className="size-4" />,
    content: "Extracting and analyzing text structure...",
  },
  {
    title: "Generating Content",
    icon: <IconBoxModel2 className="size-4" />,
    content: "Generating content using AI...",
  },
  {
    title: "Saving Project",
    icon: <IconDatabase className="size-4" />,
    content: "Saving document to the knowledge base...",
  },
];

export function FlashCardsTab({
  flashCards,
  documentContextForChat,
}: TFlashCardsTabProps) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedFlashCardId, setSelectedFlashCardId] = useState<string | null>(
    null,
  );

  const [localFlashCards, setLocalFlashCards] = useState<any[]>(flashCards);

  // I don't prefer useEffect, but it's okay for now, I may think other way round about it later.
  useEffect(() => {
    setLocalFlashCards(flashCards);
  }, [flashCards]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [generationLimits, setGenerationLimits] = useState({
    min: 0,
    max: 0,
    val: 0,
  });
  const [fetchedChunks, setFetchedChunks] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showLimitBanner, setShowLimitBanner] = useState<boolean>(false);

  const handleFlashCardSelect = (id: string) => {
    setSelectedFlashCardId(id);
    setView("detail");
  };

  const listItems = localFlashCards.map((fc) => ({
    id: fc.id,
    title: fc.title || "Generated Flash Cards",
    date: new Date(fc.created_at || Date.now()).toLocaleDateString(),
    count: Array.isArray(fc.data) ? fc.data.length : 0,
  }));

  const selectedData =
    localFlashCards.find((fc) => fc.id === selectedFlashCardId)?.data || [];

  const handleStartGeneration = async () => {
    if (!documentContextForChat?.id || !documentContextForChat?.url) return;

    if (localFlashCards.length >= 5) {
      setShowLimitBanner(true);
      return;
    }
    setShowLimitBanner(false);

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 800));
      if (signal.aborted) throw new Error("AbortError");

      setCurrentStep(2);
      let chunks: any[] = [];
      const hasChunks = documentContextForChat.totalChunks > 0;

      if (hasChunks) {
        const res = await getDocumentChunksRaw(documentContextForChat.id);
        if (!res.success) throw new Error(res.message);
        chunks = (res.chunks || []) as any[];
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
        const pythonApiUrl = `${baseUrl}/get-chunks?source=${documentContextForChat.url}`;
        const fileText = await fetch(pythonApiUrl, {signal});
        const fileJson = await fileText.json();
        if (signal.aborted) throw new Error("AbortError");
        chunks = fileJson.chunks;
      }

      setFetchedChunks(chunks);
      const length = chunks.length;
      let minItems = Math.max(10, Math.min(10, length));
      let maxItems = Math.min(50, Math.max(length * 2, minItems + 5));
      setGenerationLimits({min: minItems, max: maxItems, val: minItems});

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
    setCurrentStep(3);
    const signal = abortControllerRef.current?.signal;

    try {
      const endpoint = "/api/generate-flash-cards-summary";
      const batchSize = 3;
      let combinedResult: any[] = [];

      for (let i = 0; i < fetchedChunks.length; i += batchSize) {
        if (signal?.aborted) throw new Error("AbortError");

        const batch = fetchedChunks.slice(i, i + batchSize);
        const text = batch.map((c: any) => c.text).join("\n");
        const batchTargetCount = Math.ceil(
          generationLimits.val / Math.ceil(fetchedChunks.length / batchSize),
        );

        const res = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({text, targetCount: batchTargetCount}),
          signal,
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.result)) {
          // Stamp each card with the real page numbers of this batch's chunks.
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

      if (signal?.aborted) throw new Error("AbortError");

      setCurrentStep(4);
      const hasChunks = documentContextForChat.totalChunks > 0;

      const saveRes = await addGeneratedContentToExistingDocument(
        documentContextForChat.id,
        "flash-cards",
        combinedResult,
        `${documentContextForChat.name} - Flash Cards`,
        !hasChunks ? fetchedChunks : undefined,
      );

      if (!saveRes.success) throw new Error(saveRes.message);

      const newlyGeneratedSet = {
        id: crypto.randomUUID(),
        title: `${documentContextForChat.name} - Flash Cards`,
        created_at: new Date().toISOString(),
        data: combinedResult,
      };

      setLocalFlashCards((prev) => [newlyGeneratedSet, ...prev]);

      toast.success("Flash Cards generated successfully!");
      setIsGenerating(false);
      setCurrentStep(0);
      router.refresh();
    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "AbortError") {
        toast.error("User aborted setup process.");
      } else {
        toast.error("Generation failed!");
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
            <h3 className="text-base md:text-xl font-medium md:font-semibold mb-2.5 md:mb-4 text-center">
              How many Flash Cards do you want to generate?
            </h3>
            <FeatureCounter
              min={generationLimits.min}
              max={generationLimits.max}
              step={1}
              defaultValue={generationLimits.val}
              onChange={(val) =>
                setGenerationLimits((prev) => ({...prev, val}))
              }
            />
            <Button
              onClick={handleContinueGeneration}
              className="mt-4 md:mt-8 px-8 w-full rounded-xs md:rounded-md"
              size="lg"
            >
              Continue
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="mt-2 w-full rounded-xs md:rounded-md"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <UploadStepper
            steps={stepsForGeneration}
            currentStep={currentStep}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  if (view === "detail") {
    return (
      <div className="min-w-full">
        <div className="max-w-full flex justify-start items-center px-2.5 md:px-6 mt-1 bg-blue-300/10 rounded-none md:rounded-lg p-2.5 md:p-4 mx-1.5 md:mx-5 shadow-xs">
          <Button
            variant="outline"
            size="xs"
            className="rounded-xs md:rounded-2xl shadow-md"
            onClick={() => setView("list")}
          >
            <ArrowLeftIcon className="size-4" /> Back
          </Button>
        </div>

        <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
        <FlashCardsCarousel flashCards={selectedData} />
      </div>
    );
  }

  return (
    <>
      {flashCards.length === 0 ? (
        <EmptyState
          icon={<TbCardsFilled className="text-blue-500" />}
          title="No Flash Cards"
          description="You have no flash cards yet. Create Your first Flash Cards Carousel."
          buttonText="Create Flash Cards"
          executeOnClick={handleStartGeneration}
        />
      ) : (
        <div className="min-w-full">
          {/* <div className="max-w-full flex justify-between items-center px-6 mt-1 bg-blue-300/10 rounded-none md:rounded-lg p-4 mx-2 md:mx-5 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-lg shadow-md">
                <TbCardsFilled className="size-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Revise in a go!</span>
            </div>
            <div>
              <Button
                size={"xs"}
                variant={"outline"}
                className="rounded-full shadow-md"
                onClick={handleStartGeneration}
              >
                <PlusIcon /> Add more
              </Button>
            </div>
          </div> */}
          <TabsHeader
            Icon={TbCardsFilled}
            title="Revise in a go!"
            command="Add more"
            onClick={handleStartGeneration}
          />
          {localFlashCards.length >= 5 && showLimitBanner && <div className="max-w-full flex justify-between items-center px-2.5 md:px-6 rounded-xs md:rounded-lg pt-2"><LimitReachBanner limitMessage="You have reached the limit of 5 flash card sets for this document." /></div>}
          <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
          <FlashCardsList
            initialItems={listItems}
            onFlashCardSelect={handleFlashCardSelect}
            onDeleteFlashCard={(id) => {
              setLocalFlashCards((prev) => prev.filter((fc) => fc.id !== id));
              router.refresh();
            }}
          />
        </div>
      )}
    </>
  );
}
