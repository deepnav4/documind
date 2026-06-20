"use client";

import {useEffect, useState} from "react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {ThumbsUp, ThumbsDown, RotateCw, Copy, Check} from "lucide-react";
import {cn} from "@/lib/utils";
import {IoReload} from "react-icons/io5";

type AIResponseWrapperProps = {
  children: React.ReactNode;
  isStreaming?: boolean;
  handleRefresh: () => void;
  copyResponse: () => void;
};

export const AIResponseWrapper = ({
  children,
  isStreaming = false,
  handleRefresh,
  copyResponse,
}: AIResponseWrapperProps) => {
  const [copied, setCopied] = useState(false);
  const [messageTimestamp, setMessageTimestamp] = useState<Date | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!messageTimestamp) {
      setMessageTimestamp(new Date());
    }
  }, []);

  const handleCopy = () => {
    const text = typeof children === "string" ? children : "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="bg-gray-200/30 rounded-tl-none border-t-2 dark:bg-zinc-800/50 rounded-lg p-2 md:p-4 flex flex-col gap-3 w-full md:max-w-[85%]">
        <div className="flex justify-between items-start gap-1 md:gap-4">
          <div className="flex-1 text-sm text-slate-900 dark:text-slate-100 wrap-break-word leading-relaxed pl-0 md:pl-2 overflow-auto">
            {children}
          </div>
        </div>

        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-1.5 pt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <ThumbsUp
                  size={12}
                  className={cn(
                    `w-3 h-3 hover:cursor-pointer text-gray-600 dark:text-gray-400 ${upvoted ? "text-blue-500 dark:text-blue-500" : ""}`,
                  )}
                  onClick={() => {
                    setUpvoted(!upvoted);
                    if (downvoted) setDownvoted(false);
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Good Response</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ThumbsDown
                  size={12}
                  className={cn(
                    `w-3 h-3 hover:cursor-pointer text-gray-600 dark:text-gray-400 ${downvoted ? "text-blue-500 dark:text-blue-500" : ""}`,
                  )}
                  onClick={() => {
                    setDownvoted(!downvoted);
                    if (upvoted) setUpvoted(false);
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Bad Response</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <IoReload
                  className="w-3 h-3 hover:rotate-90 transition-all duration-500 hover:cursor-pointer text-gray-600 dark:text-gray-400"
                  onClick={handleRefresh}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenrate Response</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                {copied ? (
                  <Check className="h-3 w-3 text-blue-500 transition-colors" />
                ) : (
                  <Copy
                    className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
                    onClick={() => {
                      copyResponse();
                      setCopied(true);
                      setTimeout(() => {
                        setCopied(false);
                      }, 2000);
                    }}
                  />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Response</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
            {messageTimestamp
              ? formatTime(messageTimestamp)
              : formatTime(new Date())}
          </span>
        </div>
      </div>
    </div>
  );
};
