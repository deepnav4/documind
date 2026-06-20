"use client";

import { useState, useRef } from "react";
import PromptInputBox from "./prompt-input";
import { EmptyState } from "../empty-state";
import { TbCardsFilled } from "react-icons/tb";
import { IconUpload, IconFileText, IconBoxModel2, IconDatabase } from '@tabler/icons-react';
import { UploadStepper, StepperStep } from "@/components/upload/stepper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateEmbeddingsInBatches } from "@/utils/generate-embeddings-client";
import { getDocumentChunksRaw, processExistingDocumentForChat } from "@/actions/upload-actions";
import { SiLivechat } from "react-icons/si";

type TChatTabProps = {
  url: string;
  documentContextForChat?: any;
};

const stepsForChat: StepperStep[] = [
  { title: "Uploading File", icon: <IconUpload className="size-4" />, content: "Uploading your PDF file securely..." },
  { title: "Extracting Text", icon: <IconFileText className="size-4" />, content: "Extracting and analyzing text structure..." },
  { title: "Vectorizing", icon: <IconBoxModel2 className="size-4" />, content: "Generating vector embeddings for context..." },
  { title: "Saving Project", icon: <IconDatabase className="size-4" />, content: "Saving document to the knowledge base..." },
];

export function ChatTab({ url, documentContextForChat }: TChatTabProps) {
  const router = useRouter();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [localIsChatReady, setLocalIsChatReady] = useState(false);
  const isChatReady = documentContextForChat?.isReady || localIsChatReady;

  const handleSetupChat = async () => {
    if (!documentContextForChat) return;

    setIsSettingUp(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setCurrentStep(1); 
      await new Promise(r => setTimeout(r, 800)); 

      setCurrentStep(2); 
      let chunks: any[] = [];
      const hasChunks = documentContextForChat.totalChunks > 0;
      
      if (hasChunks) {
         
         const res = await getDocumentChunksRaw(documentContextForChat.id);
         if (!res.success || !res.chunks) throw new Error(res.message);
         chunks = (res.chunks || []) as any[];
      } else {
        
         const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
         const pythonApiUrl = `${baseUrl}/get-chunks?source=${documentContextForChat.url}`;
         const fileText = await fetch(pythonApiUrl, { signal });
         const fileJson = await fileText.json();
         if (signal.aborted) throw new Error("AbortError");
         chunks = fileJson.chunks;
      }
      
      const allTexts = chunks.map((chunk: any) => chunk.text);
      
      setCurrentStep(3); 
      const allEmbeddings = await generateEmbeddingsInBatches(allTexts, signal);
      if (signal.aborted) throw new Error("AbortError");

      const finalEmbeddingData = chunks.map((chunk: any, index: number) => ({
         id: chunk.id, 
         text: chunk.text,
         meta: chunk.meta || chunk.metadata,
         embedding: allEmbeddings[index],
      }));

      setCurrentStep(4); 
      const saveRes = await processExistingDocumentForChat(documentContextForChat.id, finalEmbeddingData);
      
      if (!saveRes.success) throw new Error(saveRes.message);
      
      toast.success("Chat properly setup!");
      setCurrentStep(0);
      setIsSettingUp(false);
      setLocalIsChatReady(true);
      router.refresh();
      
    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "AbortError") {
          toast.error("User aborted chat setup process.");
      } else {
          toast.error(error.message || "Something went wrong.");
      }
      setIsSettingUp(false);
      setCurrentStep(0);
    }
  };

  const handleCancel = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsSettingUp(false);
      setCurrentStep(0);
  };

  if (isSettingUp) {
     return (
        <div className="flex-1 flex w-full h-full justify-center items-center py-10 max-w-4xl mx-auto">
            <UploadStepper steps={stepsForChat} currentStep={currentStep} onCancel={handleCancel} />
        </div>
     );
  }

  return (
    <div className={`flex-1 flex h-full flex-col ${!isChatReady ? "items-center justify-center" : "justify-end"}`}>
      <div className="w-full">
        {!isChatReady ? (
          <div className="">
            <EmptyState
              icon={<SiLivechat className="text-blue-500" />}
              title="Chat Not Setup Yet"
              description="Your PDF is still not setup for chat. Setup Your Chat Now."
              buttonText="Setup Chat"
              executeOnClick={handleSetupChat}
            />
          </div>
        ) : (
          <div className="">
            <PromptInputBox 
                file_url={url} 
                initialMessages={documentContextForChat?.chatMessages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
