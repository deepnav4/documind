import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Separator} from "../ui/separator";
import {Button} from "../ui/button";
import Headings from "./headings";
import {ImageZoom} from "@/components/kibo-ui/image-zoom";
import Image from "next/image";

export function SystemDesign() {
  return (
    <>
      <div className="max-w-5xl w-full">
        <Headings title="How It works" subtitle="System Design" subheading="Not just another RAG Pipeline." />
        <div className="p-3 md:p-10 rounded-none md:rounded-xl bg-white dark:bg-zinc-900 w-full flex justify-center shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
          <ImageZoom>
            <Image
              alt="system design image"
              className="h-auto w-full rounded-none md:rounded-xl backdrop-blur-2xl shadow-md"
              height={800}
              src="/system-design.png"
              unoptimized
              width={1500}
            />
          </ImageZoom>
        </div>
      </div>
    </>
  );
}
