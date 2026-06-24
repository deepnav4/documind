"use client";

import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import {PlusIcon, ArrowLeftIcon} from "lucide-react";
import {Button} from "../ui/button";
import {Separator} from "../ui/separator";
import {FcMindMap} from "react-icons/fc";
import {EmptyState} from "./empty-state";
import {MindMapList} from "./mindmap-list";
import {MindMapCanvas} from "./mindmap-canvas";
import LimitReachBanner from "./limit-reach-banner";

import {UploadStepper, StepperStep} from "@/components/upload/stepper";
import {
  IconUpload,
  IconFileText,
  IconBoxModel2,
  IconDatabase,
} from "@tabler/icons-react";
import {
  getDocumentChunksRaw,
  addGeneratedContentToExistingDocument,
} from "@/actions/upload-actions";
import {toast} from "sonner";
import TabsHeader from "./tabs-header";

type TMindMapTabProps = {
  mindmaps: any[];
  documentContextForChat?: any;
};

const stepsForGeneration: StepperStep[] = [
  {
    title: "Analyzing Document",
    icon: <IconUpload className="size-4" />,
    content: "Checking document size and format...",
  },
  {
    title: "Extracting Structure",
    icon: <IconFileText className="size-4" />,
    content: "Extracting structural outlines...",
  },
  {
    title: "Generating Mind Map",
    icon: <IconBoxModel2 className="size-4" />,
    content: "Synthesizing global mind map...",
  },
  {
    title: "Saving Project",
    icon: <IconDatabase className="size-4" />,
    content: "Saving map to the knowledge base...",
  },
];

export function MindMapTab({
  mindmaps,
  documentContextForChat,
}: TMindMapTabProps) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedMindMapId, setSelectedMindMapId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const [localMindMaps, setLocalMindMaps] = useState<any[]>(mindmaps);
  const [showLimitBanner, setShowLimitBanner] = useState<boolean>(false);

  useEffect(() => {
    setLocalMindMaps(mindmaps);
  }, [mindmaps]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleMindMapSelect = (id: string) => {
    setSelectedMindMapId(id);
    setView("detail");
  };

  const listItems = localMindMaps.map((mm) => ({
    id: mm.id,
    title: mm.title || "Generated Mind Map",
    date: new Date(mm.created_at || Date.now()).toLocaleDateString(),
  }));

  const selectedMindMap = localMindMaps.find((m) => m.id === selectedMindMapId);
  const selectedData = selectedMindMap?.data || [];

  const handleBackToList = () => {
    setView("list");
    router.refresh();
  };

  const handleStartGeneration = async () => {
    if (!documentContextForChat?.id || !documentContextForChat?.url) return;

    if (localMindMaps.length >= 5) {
      setShowLimitBanner(true);
      return;
    }
    setShowLimitBanner(false);

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setCurrentStep(1); // Analyzing
      await new Promise((r) => setTimeout(r, 800));
      if (signal.aborted) throw new Error("AbortError");

      setCurrentStep(2); // Extracting Structure
      let chunks: any[] = [];
      const hasChunks = documentContextForChat.totalChunks > 0;

      // We will rely on chunks or fetch markdown via python api
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
      const pythonApiUrl = `${baseUrl}/process-document?source=${documentContextForChat.url}`;
      const resApi = await fetch(pythonApiUrl, {signal});
      const jsonApi = await resApi.json();

      if (signal.aborted) throw new Error("AbortError");

      let finalContextString = "";

      if (jsonApi.doc_type === "markdown") {
        // Document is small, use markdown directly
        finalContextString = jsonApi.data;
      } else if (jsonApi.doc_type === "chunks") {
        // Document is large, use chunks
        chunks = jsonApi.data || [];
        if (!chunks.length && hasChunks) {
          const res = await getDocumentChunksRaw(documentContextForChat.id);
          if (!res.success) throw new Error(res.message);
          chunks = (res.chunks || []) as any[];
        }

        // Generate chunk summaries in batches (Approach 1: Map Phase)
        const batchSize = 10;
        let combinedSummaries = "";
        for (let i = 0; i < chunks.length; i += batchSize) {
          if (signal.aborted) throw new Error("AbortError");
          const batch = chunks.slice(i, i + batchSize);
          const text = batch.map((c: any) => c.text).join("\\n");

          const summaryRes = await fetch("/api/mind-map", {
            method: "POST",
            body: JSON.stringify({pdfFile: text, phase: "map"}),
            signal,
          });
          const summaryData = await summaryRes.json();
          if (summaryData.success) {
            combinedSummaries += summaryData.summary + "\\n\\n";
          }
        }
        finalContextString = combinedSummaries;
      }

      if (signal.aborted) throw new Error("AbortError");
      setCurrentStep(3); // Synthesizing Global Mind Map (Reduce Phase)

      const generateRes = await fetch("/api/mind-map", {
        method: "POST",
        body: JSON.stringify({pdfFile: finalContextString}),
        signal,
      });
      const generateData = await generateRes.json();
      if (!generateData.success)
        throw new Error("Failed to synthesize mind map");

      const finalMindMap = generateData.result;

      if (signal.aborted) throw new Error("AbortError");
      setCurrentStep(4); // Saving Project

      const saveRes = await addGeneratedContentToExistingDocument(
        documentContextForChat.id,
        "mind-map",
        finalMindMap,
        `${documentContextForChat.name} - Mind Map`,
        !hasChunks && chunks.length ? chunks : undefined,
      );

      if (!saveRes.success) throw new Error(saveRes.message);

      const newlyGeneratedSet = {
        id: crypto.randomUUID(),
        title: `${documentContextForChat.name} - Mind Map`,
        created_at: new Date().toISOString(),
        data: finalMindMap,
      };

      setLocalMindMaps((prev) => [newlyGeneratedSet, ...prev]);

      toast.success("Mind Map generated successfully!");
      setIsGenerating(false);
      setCurrentStep(0);
      router.refresh();
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

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setCurrentStep(0);
  };

  if (isGenerating) {
    return (
      <div className="flex-1 flex w-full h-full justify-center items-center py-10 max-w-4xl mx-auto flex-col gap-4">
        <UploadStepper
          steps={stepsForGeneration}
          currentStep={currentStep}
          onCancel={handleCancel}
        />
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
            className="rounded-xs md:rounded-2xl shadow-md text-xs md:text-sm"
            onClick={handleBackToList}
          >
            <ArrowLeftIcon className="size-4" /> Back
          </Button>
        </div>
        <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
        <div className="p-2 md:p-6">
          <MindMapCanvas data={selectedData} />
        </div>
      </div>
    );
  }

  return (
    <>
      {localMindMaps.length === 0 ? (
        <EmptyState
          icon={<FcMindMap />}
          title="No Mind Maps"
          description="You haven't created any mind maps yet. Create Your first Mind Map."
          buttonText="Create Mind Map"
          executeOnClick={handleStartGeneration}
        />
      ) : (
        <div className="min-w-full">
          {/* <div className="max-w-full flex justify-between items-center px-6 mt-1 bg-blue-300/10 rounded-lg p-4 mx-5">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-lg shadow-md">
                <FcMindMap className="size-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Map Your Knowledge.</span>
            </div>
            <div>
              <Button
                size={"xs"}
                variant={"outline"}
                className="rounded-full shadow-md"
                onClick={handleStartGeneration}
              >
                <PlusIcon /> Draw Another
              </Button>
            </div>
          </div> */}
          <TabsHeader
            Icon={FcMindMap}
            title="Map Your Knowledge."
            command="Draw Another"
            onClick={handleStartGeneration}
          />
          {localMindMaps.length >= 5 && showLimitBanner && <div className="max-w-full flex justify-between items-center px-2.5 md:px-6 rounded-xs md:rounded-lg pt-2"><LimitReachBanner limitMessage="At once you can create max. 5 mind maps for each project." /></div>}
          <Separator className="mt-2.5 md:mt-4 mx-1.5 md:mx-6 opacity-40 dark:opacity-70" />
          <MindMapList
            initialItems={listItems}
            onMindMapSelect={handleMindMapSelect}
            onDeleteMindMap={(id) => {
              setLocalMindMaps((prev) => prev.filter((m) => m.id !== id));
              router.refresh();
            }}
          />
        </div>
      )}
    </>
  );
}
