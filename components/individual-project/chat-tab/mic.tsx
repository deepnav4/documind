"use client";

import {SpeechInput} from "@/components/ai-elements/speech-input";
import {usePromptInputController} from "@/components/ai-elements/prompt-input";
import {useCallback, useState} from "react";

const handleAudioRecordedFallback = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    body: formData,
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Transcription failed");
  }

  const data = await response.json();
  return data.text;
};

interface MicPromptInputBoxProps {
  isFormattingInput: boolean;
  setIsFormattingInput: React.Dispatch<React.SetStateAction<boolean>>;
}

const MicPromptInputBox = ({ isFormattingInput, setIsFormattingInput }: MicPromptInputBoxProps) => {
  const controller = usePromptInputController();
  const [transcript, setTranscript] = useState("");

  const handleTranscriptionComplete = useCallback(
    async (text: string) => {
      console.log("Joined Transcript:", text);
      setIsFormattingInput(true);
      try {
        const punctuationResponse = await fetch("/api/correct-prompt-punctuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });

        let finalText = text;
        if (punctuationResponse.ok) {
          const parsed = await punctuationResponse.json();
          finalText = parsed.text;
          console.log("Formatted Transcript:", finalText);
        }

        const currentText = controller.textInput.value;
        const newText = currentText ? `${currentText} ${finalText}` : finalText;
        controller.textInput.setInput(newText);
        setTranscript(newText);
      } catch (error) {
        console.error("Punctuation API failed:", error);
      } finally {
        setIsFormattingInput(false);
      }
    },
    [controller],
  );

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <div className="flex gap-2">
        <SpeechInput
          onTranscriptionComplete={handleTranscriptionComplete}
          onAudioRecorded={handleAudioRecordedFallback}
          size="icon"
          variant="outline"
          className="dark:text-white"
          disabled={isFormattingInput}
          isProcessing={isFormattingInput}
        />
      </div>
    </div>
  );
};

export default MicPromptInputBox;
