"use client";

import {forwardRef, useRef} from "react";
import {Button} from "../ui/button";
import {ArrowBigLeft, ArrowLeftIcon, Loader2} from "lucide-react";
import AnimatedFileUpload from "./upload-file";
import InitialOption from "./choose-intial-option";
import {FormEvent} from "react";
import { Separator } from "../ui/separator";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { useRouter } from "next/navigation";

interface UploadFormInputProps {
  onsubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const UploadFormInputPDF = forwardRef<
  HTMLFormElement,
  UploadFormInputProps
>(({onsubmit, isLoading}, ref) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
const router = useRouter();

  return (
    <div>
      <div className="mb-5 flex flex-col gap-1.5 justify-start items-start w-full">
        <div className="flex justify-between items-baseline w-full">
          <Button variant={"outline"} className="shadow-md flex gap-1 rounded-xs md:rounded-md hover:cursor-pointer" onClick={() => {router.push("/dashboard")}}> <ArrowLeftIcon className="size-4"/> Back </Button>
          <AnimatedThemeToggler />
        </div>
        <Separator />
      </div>
      <div className="w-full justify-items-center mb-10">
        <h1 className="font-bold text-3xl text-center ">Upload your PDF</h1>
        <p className="text-center text-muted-foreground">
          Upload PDF and choose what you want to do with it.
        </p>
      </div>
      <form className="flex flex-col g-6" onSubmit={onsubmit} ref={ref}>
        <div className="">
          <AnimatedFileUpload
            accept=".pdf"
            disabled={isLoading}
            multiple={false}
            maxSize={20 * 1024 * 1024}
            className="mb-5 shadow-lg dark:shadow-zinc-800/60 md:dark:shadow-zinc-600/40 rounded-xs md:rounded-lg backdrop-blur-md"
            onFilesSelected={(files: File[]) => {
              if (hiddenInputRef.current) {
                if (files.length > 0) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(files[0]);
                  hiddenInputRef.current.files = dataTransfer.files;
                } else {
                  hiddenInputRef.current.value = "";
                }
              }
            }}
          />

          <input
            type="file"
            ref={hiddenInputRef}
            name="file"
            className="hidden"
          />
          <InitialOption />
          <p className="text-xs text-left font-light mt-2">
            *Choose any one option from above now, you can select other options
            later also for the same PDF.
          </p>
          <Button type="submit" disabled={isLoading} className="w-full mt-8 rounded-none md:rounded-xl">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...{" "}
              </>
            ) : (
              "Submit PDF"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});
