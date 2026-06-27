"use client";

import { useSearchParams } from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconSettings,
} from "@tabler/icons-react";

import {QuizTab} from "./quiz-tab/quiz-tab";
import {MindMapTab} from "./mindmap-tab";
import {FlashCardsTab} from "./flash_cards-tab/flash_cards-tab";
import {ChatTab} from "./chat-tab/chat-tab";
import {IoChatbubbleOutline} from "react-icons/io5";
import {TbCards} from "react-icons/tb";
import {SiQuizlet} from "react-icons/si";
import {FcMindMap} from "react-icons/fc";
import {SiLivechat} from "react-icons/si";
import {HiOutlineChatBubbleBottomCenter} from "react-icons/hi2";
import {PiCardsThreeBold} from "react-icons/pi";
import { Suspense } from "react";

type TTabSelectionContentProps = {
  url: string;
  generatedContent?: any[];
  documentContextForChat?: any;
}

function TabSelectionContent({ url, generatedContent = [], documentContextForChat }: TTabSelectionContentProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "chat";

  const flashCards = generatedContent.filter(c => c.feature_type === 'flash-cards');
  const quizzes = generatedContent.filter(c => c.feature_type === 'quiz');
  const mindmaps = generatedContent.filter(c => c.feature_type === 'mind-map');

  return (
    <div className="flex w-full h-full flex-col gap-4">
      <Tabs defaultValue={defaultTab} className="flex flex-col h-full">
        <TabsList className="w-full shrink-0 rounded-none md:rounded-sm overflow-x-auto md:overflow-hidden md:hide-scrollbar thin-scrollbar">
          <TabsTrigger value="chat" className="rounded-xs md:rounded-sm">
            <SiLivechat className="size-2.5 md:size-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="flash-cards" className="rounded-xs md:rounded-sm">
            <PiCardsThreeBold className="size-3 md:size-4" />
            Flash Cards
          </TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-xs md:rounded-sm">
            <SiQuizlet className="size-3 md:size-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="mind-map" className="rounded-xs md:rounded-sm">
            <FcMindMap className="size-2.5 md:size-4 grayscale" />
            Mind Map
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="chat"
          className="flex-1 mt-0 border-0 p-0 overflow-hidden"
        >
          <ChatTab url={url} documentContextForChat={documentContextForChat} />
        </TabsContent>
        <TabsContent
          value="flash-cards"
          className="flex-1 mt-0 border-0 p-0 overflow-hidden"
        >
          <FlashCardsTab flashCards={flashCards} documentContextForChat={documentContextForChat} />
        </TabsContent>
        <TabsContent
          value="quiz"
          className="flex-1 mt-0 border-0 p-0 overflow-hidden"
        >
          <QuizTab quizzes={quizzes} documentContextForChat={documentContextForChat} />
        </TabsContent>
        <TabsContent
          value="mind-map"
          className="flex-1 mt-0 border-0 p-0 overflow-hidden"
        >
          <MindMapTab mindmaps={mindmaps} documentContextForChat={documentContextForChat} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SelectTheTab({ url, generatedContent = [], documentContextForChat }: { url: string, generatedContent?: any[], documentContextForChat?: any }) {
  return (
    <Suspense fallback={<div className="p-4">Loading tabs...</div>}>
      <TabSelectionContent url={url} generatedContent={generatedContent} documentContextForChat={documentContextForChat} />
    </Suspense>
  );
}
