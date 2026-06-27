"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {SelectTheTab} from "../individual-project/tabs";
import {useState, useEffect, useMemo} from "react";
import { cn } from "@/lib/utils";
import { PdfPageProvider } from "../individual-project/pdf-page-context";

type TResizablePanelExampleProps = {
  url: string;
  generatedContent?: any[];
  documentContextForChat?: any;
};

export function ResizablePanelExample({
  url,
  generatedContent = [],
  documentContextForChat,
}: TResizablePanelExampleProps) {
  const [page, setPage] = useState(1);
  const [showNudge, setShowNudge] = useState(false);

  // Lets the chat citations (e.g. "Page 2") drive the PDF viewer's page.
  const pageContextValue = useMemo(
    () => ({ goToPage: (p: number) => setPage(p) }),
    []
  );

  useEffect(() => {
    const hasSeenNudge = localStorage.getItem("hasSeenMobileResizeNudge");
    if (!hasSeenNudge) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissNudge = () => {
    if (showNudge) {
      setShowNudge(false);
      localStorage.setItem("hasSeenMobileResizeNudge", "true");
    }
  };

  return (
    <PdfPageProvider value={pageContextValue}>
      <div className="flex w-full min-h-[calc(150vh-4rem)] md:hidden">
        <ResizablePanelGroup orientation="vertical" className="h-full w-full">
          <ResizablePanel minSize={10} defaultSize={70}>
            <div className="h-full w-full p-1 md:p-2 md:pt-1">
              <SelectTheTab
                url={url}
                generatedContent={generatedContent}
                documentContextForChat={documentContextForChat}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle 
            onPointerDown={dismissNudge}
            onTouchStart={dismissNudge}
            onClick={dismissNudge}
            className={cn(
              "before:bg-muted-foreground/25 hover:before:bg-muted-foreground/50 active:before:bg-primary before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-1 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-all before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] hover:before:w-8 active:before:w-12 active:before:h-1.5",
              showNudge && "before:bg-primary before:animate-pulse before:w-10 before:h-1.5 before:shadow-[0_0_15px_rgba(100,100,250,0.8)] z-50 bg-primary/10"
            )}
          >
            {showNudge && (
              <aside className="max-w-[90%] absolute z-[100] pointer-events-none flex flex-row items-center justify-center animate-bounce drop-shadow-xl rounded-lg p-2 px-3 bg-primary text-primary-foreground text-xs font-semibold left-1/2 -translate-x-1/2 bottom-4 whitespace-nowrap">
                <span>Drag the handle to expand or collapse.<br /> Will be needed to reveal contents if necessary!</span>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary absolute -bottom-[7px]"></div>
              </aside>
            )}
          </ResizableHandle>
          <ResizablePanel minSize={10} defaultSize={80}>
            <div className="flex h-full w-full items-center justify-center p-2 pb-1">
              <iframe
                key={page}
                src={`${url}#page=${page}`}
                className="w-full h-full rounded-none hidden md:block"
              />
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                className="w-full h-full rounded-md rounded-b-none md:hidden"
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="hidden w-full h-[calc(100vh-50px)] md:flex">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel minSize={10} defaultSize={40}>
            <div className="flex h-full items-center justify-center p-6 pb-1">
              <iframe
                key={page}
                src={`${url}#page=${page}`}
                className="w-full h-full rounded-md rounded-b-none"
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className="before:bg-muted-foreground/25 hover:before:bg-muted-foreground/50 active:before:bg-primary before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-6 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-all before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] hover:before:h-8 active:before:h-12 active:before:w-1.5" />

          <ResizablePanel minSize={10} defaultSize={60}>
            <div className="h-full p-5 pt-1">
              <SelectTheTab
                url={url}
                generatedContent={generatedContent}
                documentContextForChat={documentContextForChat}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PdfPageProvider>
  );
}
