import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Separator} from "../ui/separator";
import {Button} from "../ui/button";
import Headings from "./headings";

export function FaqsSection() {
  return (
    <>
      <div className="w-full md:max-w-5xl">
        <Headings title="Frequently Asked Questions" subtitle="FAQs" />
        <div className="p-4 sm:p-10 rounded-none md:rounded-xl bg-white dark:bg-zinc-900 w-full max-w-full">
          <Accordion type="single" collapsible defaultValue="shipping">
            <AccordionItem value="01">
              <AccordionTrigger>Is my uploaded PDF saved?</AccordionTrigger>
              <AccordionContent>
                Yes. Uploaded PDFs are stored securely through UploadThing and linked to your authenticated account. DocuMind saves the generated content, document chunks, and chat-ready embeddings so you can return to your project later from the dashboard.",
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="02">
              <AccordionTrigger>
                What types of PDFs work best?
              </AccordionTrigger>
              <AccordionContent>
                DocuMind is designed for any structured or unstructured pdf such as textbooks, lecture notes, research papers, reports and documentation. It can also handle more complex PDFs better than basic text extraction because the parsing pipeline is document-aware i.e. according to tables, headers, footers and etc.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="03">
              <AccordionTrigger>
                Can I chat with a specific page or section?
              </AccordionTrigger>
              <AccordionContent>
                Yes! When a PDF is set up for chat, DocuMind stores searchable chunks with page metadata. You can ask things like “explain page 2” or “summarize the section about neural networks,” and the chat system answers it accordingly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="04">
              <AccordionTrigger>
                Can I use DocuMind for exam revision?
              </AccordionTrigger>
              <AccordionContent>
                Yes! Documind generated Flash Cards, You can practise multiple quizzes here and can map your entire lecture slide as Mindmap, all together making it best tool for your revision.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="05">
              <AccordionTrigger>
                What happens after I upload a PDF?
              </AccordionTrigger>
              <AccordionContent>
                After upload, DocuMind processes the PDF, extracts structured content, and prepares it for the feature you selected. For chat, it creates searchable embeddings; for flashcards, quizzes, and mind maps, it uses the extracted content to generate interactive study material.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
