import {ArrowRight, FileText, Zap, Code, Upload} from "lucide-react";
import {Badge} from "../ui/badge";
import {Button} from "../ui/button";
import Link from "next/link";
import {Highlighter} from "@/components/ui/highlighter";
import { instrumentSerif } from "@/lib/fonts";

export const CurlyArrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M90 10 C 60 5, 20 20, 40 50 C 60 70, 70 30, 40 20 C 20 15, 10 50, 10 80"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M0 65 L 10 80 L 22 72"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Hero() {
  return (
    <div className="relative overflow-hidden mx-auto max-w-4xl mt-16 pb-16 text-center z-10 px-4">
      <section className="flex flex-col items-center">
        {/* PILL BADGE */}
        <div className="flex">
          <div className="shadow-lg relative overflow-hidden rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-white/10 dark:via-white/20 dark:to-white/10 group">
            <Badge
              variant="secondary"
              className="border border-b-0 border-gray-50 dark:border-white/10 relative px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full group-hover:bg-gray-50 dark:group-hover:bg-black/70 transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer shadow-sm"
            >
              <span
                className="shrink-0 block rounded-full animate-pulse"
                style={{width: 8, height: 8, backgroundColor: "#22c55e"}}
              ></span>
              Now mind maps are also available
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </Badge>
          </div>
        </div>

        {/* MAIN HEADING */}
        {/* MOBILE ONLY HEADING DECORATION */}
        <div className="flex md:hidden flex-col items-center mt-6 mb-3">
          <span className={`font-light text-sm md:text-base italic ${instrumentSerif.className}`}>
            <Highlighter action="circle" color="#FF9800">
              Structured, Unstructured or Scanned
            </Highlighter>
          </span>
          <CurlyArrow className="w-5 h-5 md:w-6 md:h-6 mt-2 text-gray-400 scale-x-[-1] md:scale-x-100" />
        </div>

        {/* DESKTOP ONLY HEADING DECORATION */}
        <div className="hidden md:flex flex-col items-center w-full">
          <span className={`mt-8 ml-52 font-light text-lg italic ${instrumentSerif.className}`}>
            <Highlighter action="circle" color="#FF9800">
              Structured, Unstructured or Scanned
            </Highlighter>
          </span>
          <br className="sm:block" />
          <CurlyArrow className="w-7 h-7 ml-32 -mt-5" />
        </div>
        <h1 className="font-medium text-[2rem] leading-tight sm:text-4xl md:text-5xl tracking-tight text-slate-900 dark:text-white">
          Turn any <Highlighter action="highlight" color="#FF9800">PDF</Highlighter> into <br className="hidden sm:block" />
          <span className="font-normal text-[1.5rem] leading-tight sm:text-4xl md:text-5xl bg-linear-to-r from-gray-800 via-gray-600 to-gray-400 dark:from-gray-200 dark:via-gray-400 dark:to-gray-600 bg-clip-text text-transparent inline-block mt-2 md:mt-0">
            Your Ultimate Study Guide
          </span>
        </h1>

        {/* SUBHEADING */}
        <h2 className="mt-6 text-xs sm:text-base md:text-lg text-muted-foreground max-w-2xl px-2 md:px-0">
          Upload your documents, textbooks, lecture slides, or research paper PDFs. DocuMind's
          AI instantly generates <span className="font-medium">flashcards</span>, <span className="font-medium">quizzes</span>, <span className="font-medium">mind maps</span>, and <span className="font-medium">lets you chat</span> with your documents in seconds.
        </h2>

        {/* FEATURE CARDS */}
        <div className="mt-10 flex flex-row justify-center gap-2.5 md:gap-5 w-full max-w-3xl">
          {/* Card 1: Powered by Docling */}
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 rounded-none md:rounded-xl p-2 md:p-4 text-left flex-1 shadow-md dark:shadow-none dark:border dark:border-white/10 transition-shadow">
            <div className="rounded-none md:rounded-lg bg-orange-100 dark:bg-orange-500/20 p-1.5 md:p-2 text-orange-500 dark:text-orange-400">
              <FileText className="md:h-5 md:w-5 h-3 w-3" />
            </div>
            <div>
              <h3 className="font-medium text-sm md:text-base text-slate-900 dark:text-white">
                Powered by Docling
              </h3>
              <p className="text-xs hidden md:block md:text-sm text-muted-foreground mt-0.5 leading-snug">
                Flawlessly extracts complex tables & scanned documents.
              </p>
            </div>
          </div>

          {/* Card 2: Instant Results */}
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 rounded-none md:rounded-xl p-2 md:p-4 text-left flex-1 shadow-md dark:shadow-none dark:border dark:border-white/10 transition-shadow">
            <div className="rounded-none md:rounded-lg bg-blue-100 dark:bg-blue-500/20 p-1.5 md:p-2 text-blue-500 dark:text-blue-400">
              <Zap className="h-3 w-3 md:h-5 md:w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm md:text-base text-slate-900 dark:text-white">
                Instant AI Generation
              </h3>
              <p className="text-xs hidden md:block md:text-sm text-muted-foreground mt-0.5 leading-snug">
                Flashcards, quizzes, mind maps and live chat ready in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-2 md:px-0">
          <Link href="/upload" className="w-full sm:w-auto">
            <Button className="w-full shadow-md bg-linear-to-t from-blue-700 via-blue-600 to-blue-400 hover:from-blue-600 hover:via-blue-500 hover:to-blue-300 rounded-none md:rounded-xl hover:cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Upload PDF
            </Button>
          </Link>
          <Link href="#example-output" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full bg-white dark:bg-transparent text-slate-900 dark:text-white opacity-100 shadow-xs border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 rounded-none md:rounded-xl hover:cursor-pointer">
              <Code className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" /> View Example Output
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
