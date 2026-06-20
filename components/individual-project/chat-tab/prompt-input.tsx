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
import MicPromptInputBox from "./mic";
import {Separator} from "@/components/ui/separator";
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
import {useParams} from "next/navigation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {AIResponseWrapper} from "./chat-reactions";
import {Spinner} from "@/components/ui/spinner";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {usePdfPage} from "@/components/individual-project/pdf-page-context";

const SUBMITTING_TIMEOUT = 200;
const STREAMING_TIMEOUT = 2000;

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
      text: "Hello and welcome! I'm DocuMind's AI.\nAsk me anything about the document.",
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

import {saveChatHistory} from "@/actions/update-chat";

type TPromptInputBoxProps = {
  file_url: string;
  initialMessages?: any;
};
// Splits an assistant answer into the main body and the trailing "Sources"
// section (heading included) so the sources can be rendered one size smaller
// and slightly duller. Falls back to {body: text, sources: null} when no
// standalone "Sources" heading is present, leaving rendering unchanged.
function splitSourcesSection(text: string): {body: string; sources: string | null} {
  const re =
    /\n[ \t]*(?:#{1,6}[ \t]*)?(?:\*\*|__)?[ \t]*sources[ \t]*:?[ \t]*(?:\*\*|__)?[ \t]*(?=\n)/gi;
  let idx = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) idx = m.index;
  if (idx === -1) return {body: text, sources: null};
  return {
    body: text.slice(0, idx).replace(/\s+$/, ""),
    sources: text.slice(idx).replace(/^\s+/, ""),
  };
}

const PromptInputBox = ({file_url, initialMessages}: TPromptInputBoxProps) => {
  const [isFormattingInput, setIsFormattingInput] = useState(false);
  const params = useParams();
  const document_id = params?.id as string | undefined;

  const {goToPage} = usePdfPage();

  const {messages, sendMessage, status, regenerate, setMessages} = useChat({
    id: document_id,
  });

  // Intercept "[Page N](#page=N)" citation clicks in the capture phase so the
  // left PDF viewer jumps to that page instead of Streamdown opening its
  // link-safety modal / a new tab. Only page citations are handled; every other
  // link is left to Streamdown's default behavior, completely untouched.
  const handleCitationClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Streamdown renders a link either as a plain <a href="#page=N"> or, when
      // its link-safety modal is enabled (the default here), as a
      // <button data-streamdown="link"> that carries NO href in the DOM. Match
      // both variants via the shared data attribute.
      const linkEl = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-streamdown="link"]',
      );
      if (!linkEl) return;

      // Prefer the href (anchor variant); fall back to the visible label like
      // "Page 2" or a range "Page 4–5" (button variant — all the DOM exposes
      // there). We take the FIRST page number, and require the label to start
      // with "Page"/"Pages" so non-citation links are never hijacked.
      const href = linkEl.getAttribute("href") || "";
      let match = href.match(/#page=(\d+)/);
      if (!match) {
        match = (linkEl.textContent || "").match(/^\s*pages?\s+(\d+)/i);
      }
      if (!match) return;

      const pageNum = parseInt(match[1], 10);
      if (Number.isNaN(pageNum)) return;

      // Confirmed a page citation: stop Streamdown's handler and jump the PDF.
      e.preventDefault();
      e.stopPropagation();
      goToPage(pageNum);
    },
    [goToPage],
  );

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

  const isStreaming = status === "streaming";

  useEffect(() => {
    if (hasInitialized && document_id && messages.length > 0 && !isStreaming) {
      const timeout = setTimeout(() => {
        saveChatHistory(document_id, messages);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [messages, document_id, isStreaming, hasInitialized]);

  const handleRefresh = useCallback(() => {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    if (!lastUserMessage) {
      console.warn("No previous user message");
      return;
    }

    if (!document_id) {
      console.warn("Missing document_id");
      return;
    }

    const text = lastUserMessage.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ");

    sendMessage(
      {text},
      {
        body: {document_id},
      },
    );
  }, [messages, document_id, sendMessage]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (status === "submitted" || status === "streaming") return;

      if (!document_id) {
        console.warn("Document ID is missing; cannot send chat request.");
        return;
      }

      console.log("Submitting message:", message);

      sendMessage({text: message.text}, {body: {document_id, file_url}});
    },
    [sendMessage, status, document_id],
  );
  console.log("MESSAGES:", messages);
  return (
    <div className="max-w-full mx-auto relative size-full h-[calc(100vh-4rem)] pt-2.5 md:pt-12">
      <div className="flex flex-col h-full" onClickCapture={handleCitationClickCapture}>
        <Conversation className="h-full thin-scrollbar">
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
                          {(() => {
                            const fullText = message.parts
                              .filter((part: any) => part.type === "text")
                              .map((part: any) => part.text)
                              .join("");
                            const {body, sources} =
                              splitSourcesSection(fullText);
                            return (
                              <>
                                <MessageResponse key={`${message.id}-body`}>
                                  {body}
                                </MessageResponse>
                                {sources && (
                                  <div className="mt-1 opacity-70 [&_p]:text-xs [&_li]:text-xs [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm">
                                    <MessageResponse
                                      key={`${message.id}-sources`}
                                    >
                                      {sources}
                                    </MessageResponse>
                                  </div>
                                )}
                              </>
                            );
                          })()}
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
              <div className="text-left flex items-center gap-2">
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
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputAttachmentsDisplay />
            <PromptInputBody>
              <PromptInputTextarea
                disabled={isFormattingInput}
                className={
                  isFormattingInput ? "opacity-30 pointer-events-none" : ""
                }
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

export default PromptInputBox;
