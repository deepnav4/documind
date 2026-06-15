"use client";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import type {AttachmentData} from "@/components/ai-elements/attachments";
import type {PromptInputMessage} from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {GlobeIcon} from "lucide-react";
import {memo, useCallback, useState, useEffect} from "react";
import {DefaultChatTransport} from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {useChat} from "@ai-sdk/react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

import {Spinner} from "@/components/ui/spinner";

interface AttachmentItemProps {
  attachment: AttachmentData;
  onRemove: (id: string) => void;
}

const WELCOME_MESSAGE = {
  id: "welcome-message",
  role: "assistant" as const,
  parts: [
    {
      type: "text" as const,
      text: "Hello and welcome! I'm Kensin, DocuMind's demo assistant.\nAsk me what DocuMind does, how PDF chat works, or how it creates flashcards, quizzes, and mind maps.",
    },
  ],
};

const AttachmentItem = memo(({attachment, onRemove}: AttachmentItemProps) => {
  const handleRemove = useCallback(
    () => onRemove(attachment.id),
    [onRemove, attachment.id],
  );
  return (
    <Attachment data={attachment} key={attachment.id} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
});

AttachmentItem.displayName = "AttachmentItem";

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => attachments.remove(id),
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

import MicPromptInputBox from "../individual-project/chat-tab/mic";
import { AIResponseWrapper } from "../individual-project/chat-tab/chat-reactions";

type TPromptInputBoxProps = {
  file_url?: string;
  initialMessages?: any;
};
const ChatDemo = ({file_url, initialMessages}: TPromptInputBoxProps) => {
  const [isFormattingInput, setIsFormattingInput] = useState(false);

  const {messages, sendMessage, status, setMessages} = useChat({
        transport: new DefaultChatTransport({
          api: "/api/demo-chatbot",
        }),
      });

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      const parsedMessages = initialMessages
        ? typeof initialMessages === "string"
          ? JSON.parse(initialMessages)
          : initialMessages
        : [];
      if (parsedMessages.length > 0) {
        setMessages(parsedMessages);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, initialMessages, setMessages]);

  const handleRefresh = useCallback(() => {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    if (!lastUserMessage) {
      console.warn("No previous user message");
      return;
    }

    const text = lastUserMessage.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ");

    sendMessage({text});
  }, [messages, sendMessage]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (status === "submitted" || status === "streaming") return;

      sendMessage({text: message.text}, {body: {file_url}});
    },
    [sendMessage, status, file_url],
  );
  return (
    <div className="relative mx-auto flex size-full max-w-full overflow-hidden p-3 sm:p-4 md:p-5">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-background/95 shadow-sm">
        <Conversation className="min-h-0 flex-1 thin-scrollbar">
          <ConversationContent>
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const reasoningParts =
                message.parts?.filter((p: any) => p.type === "reasoning") || [];
              const hasReasoning = reasoningParts.length > 0;
              const reasoningText = reasoningParts
                .map((p: any) => p.text)
                .join("\n\n");
              const lastPart = message.parts?.at(-1);
              const isReasoningStreaming =
                isLastMessage &&
                status === "streaming" &&
                lastPart?.type === "reasoning";

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts ? (
                      message.role === "assistant" ? (
                        <AIResponseWrapper
                          copyResponse={() => {
                            navigator.clipboard.writeText(
                              message.parts
                                ?.filter((part: any) => part.type === "text")
                                .map((part: any) => part.text)
                                .join("") || "",
                            );
                          }}
                          handleRefresh={handleRefresh}
                          isStreaming={status === "streaming" && isLastMessage}
                        >
                          {hasReasoning && (
                            <Reasoning
                              className="w-full"
                              isStreaming={isReasoningStreaming}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>
                                {reasoningText}
                              </ReasoningContent>
                            </Reasoning>
                          )}
                          <MessageResponse key={message.id}>
                            {message.parts
                              .filter((part: any) => part.type === "text")
                              .map((part: any) => part.text)
                              .join("")}
                          </MessageResponse>
                          {/* <Sources className="mt-5">
                            <SourcesTrigger
                              count={
                                message.parts.filter(
                                  (part) => part.type === "source-document",
                                ).length
                              }
                            />
                            {message.parts.map((part, i) => {
                              switch (part.type) {
                                case "source-url":
                                  return (
                                    <SourcesContent key={`${message.id}-${i}`}>
                                      <Source
                                        key={`${message.id}-${i}`}
                                        href={part.url}
                                        title={part.url}
                                      />
                                    </SourcesContent>
                                  );
                              }
                            })}
                          </Sources> */}
                        </AIResponseWrapper>
                      ) : (
                        <MessageResponse key={message.id}>
                          {message.parts
                            .filter((part: any) => part.type === "text")
                            .map((part: any) => part.text)
                            .join("")}
                        </MessageResponse>
                      )
                    ) : null}
                  </MessageContent>
                </Message>
              );
            })}
            {status === "submitted" && (
              <div className="flex items-center gap-2 px-1 pb-2 text-left">
                <Spinner />{" "}
                <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                  Thinking...
                </p>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInputProvider>
          <PromptInput
            className="shrink-0 rounded-none border-x-0 border-b-0 shadow-none"
            globalDrop
            multiple
            onSubmit={handleSubmit}
          >
            <PromptInputAttachmentsDisplay />
            <PromptInputBody>
              <PromptInputTextarea
                disabled={isFormattingInput}
                className={`max-h-24 min-h-16 resize-none text-sm sm:min-h-20 ${
                  isFormattingInput ? "opacity-30 pointer-events-none" : ""
                }`}
              />
            </PromptInputBody>
            {/* <Separator className="w-9/12"/> */}
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionAddScreenshot />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  onClick={() => {
                    console.log("Do web search baby !");
                  }}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
              </PromptInputTools>
              <div className="flex gap-2">
                <MicPromptInputBox
                  isFormattingInput={isFormattingInput}
                  setIsFormattingInput={setIsFormattingInput}
                />
                <PromptInputSubmit
                  status={status}
                  disabled={isFormattingInput}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
};

export default ChatDemo;
