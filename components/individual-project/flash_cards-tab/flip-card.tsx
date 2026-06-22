"use client";

import {ArrowRight, Repeat2} from "lucide-react";
import {useState, useEffect} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {usePdfPage} from "@/components/individual-project/pdf-page-context";

export interface CardFlipProps {
  question?: string;
  answer?: string;
  index?: number;
  source?: number[];
}

export default function CardFlip({
  question = "UnDesign Systems",
  answer = "Dive deep into the world of modern UI/UX design.",
  index,
  source,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHoverable, setIsHoverable] = useState(false);
  const {goToPage} = usePdfPage();
  const hoverClass = isHoverable ? "group-hover:shadow-lg" : "";

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)");

    const handleChange = () => {
      setIsHoverable(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <div
      className="group relative h-[320px] w-full max-w-[280px] [perspective:2000px] touch-manipulation"
      onMouseEnter={isHoverable ? () => setIsFlipped(true) : undefined}
      onMouseLeave={isHoverable ? () => setIsFlipped(false) : undefined}
      onClick={(e) => {
        if (!isHoverable) {
          e.stopPropagation();
          console.log("clicked");
          setIsFlipped((prev) => !prev);
        }
      }}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "transform-3d",
          "transition-all duration-700",
          isFlipped
            ? "transform-[rotateY(180deg)]"
            : "transform-[rotateY(0deg)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-sm md:rounded-2xl",
            "bg-zinc-50 dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800/50",
            "shadow-xs dark:shadow-lg",
            "transition-all duration-700",
            "dark:group-hover:shadow-xl",
            isHoverable ? "group-hover:shadow-lg" : "",
            isFlipped ? "opacity-0" : "opacity-100",
          )}
        >
          <div
            style={{pointerEvents: isFlipped ? "none" : "auto"}}
            className="relative h-full overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black"
          >
            <div className="absolute top-6 left-6">
              <span className="font-sans text-[42px] font-light leading-none text-indigo-300/80 dark:text-zinc-700/60 tracking-tight">
                Q.
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center px-8 pb-8 pt-12">
              <div className="relative w-full text-center text-[17px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                {question}
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                {/* <h3 className={`font-semibold text-lg text-zinc-900 leading-snug tracking-tighter transition-all duration-500 ease-out-expo dark:text-white ${isHoverable ? "group-hover:translate-y-[-4px]" : ""}`}>
                  {title}
                </h3> */}
                <p
                  className={`hidden md:inline line-clamp-2 text-xs text-zinc-400 tracking-tight transition-all delay-[50ms] duration-500 ease-out-expo dark:text-zinc-200 ${isHoverable ? "group-hover:translate-y-[-4px]" : ""}`}
                >
                  {/* {subtitle} */}
                  Hover to see answer
                </p>
                <p
                  className={`inline md:hidden line-clamp-2 text-xs text-zinc-400 tracking-tight transition-all delay-[50ms] duration-500 ease-out-expo dark:text-zinc-200 ${isHoverable ? "group-hover:translate-y-[-4px]" : ""}`}
                >
                  {/* {subtitle} */}
                  Tap to see answer
                </p>
              </div>
              <div className="group/icon relative">
                <div
                  className={cn(
                    "absolute inset-[-8px] rounded-xs md:rounded-lg transition-opacity duration-300",
                    "bg-linear-to-br from-orange-500/20 via-orange-500/10 to-transparent",
                  )}
                />
                {/* <Repeat2 className={`relative z-10 h-4 w-4 text-orange-500 transition-transform duration-300 ${isHoverable ? "group-hover/icon:-rotate-12 group-hover/icon:scale-110" : ""}`} /> */}
                <div
                  className={`relative flex justify-center items-center z-10 w-7 h-7 text-sm font-semibold text-orange-500 transition-transform duration-300 ${isHoverable ? "group-hover/icon:-rotate-12 group-hover/icon:scale-110" : ""}`}
                >
                  {index !== undefined ? index + 1 : 1}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          style={{pointerEvents: isFlipped ? "auto" : "none"}}
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-sm md:rounded-2xl p-6",
            "bg-linear-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-xs dark:shadow-lg",
            "flex flex-col",
            "transition-all duration-700",
            "group-hover:shadow-lg dark:group-hover:shadow-xl",
            isFlipped ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="w-full flex justify-start">
            <span className="font-sans text-[42px] font-light leading-none text-indigo-300/80 dark:text-zinc-700/60 tracking-tight">
              A.
            </span>
          </div>
          {/* <div className="flex-1 flex justify-start items-center pb-8 pt-2">
            <div className="text-left text-[16px] leading-relaxed font-medium text-zinc-700 dark:text-zinc-300 w-full overflow-y-auto max-h-full pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              {answer}
            </div>
          </div> */}
          <div className="flex-1 min-h-0 flex justify-start items-start pb-4 pt-2">
            <div className="text-left text-[16px] leading-relaxed font-medium text-zinc-700 dark:text-zinc-300 w-full overflow-y-auto h-full pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              {answer}
            </div>
          </div>

          <div className="mt-6 border-zinc-200 border-t pt-6 dark:border-zinc-800">
            <div
              className={cn(
                "group/start relative",
                "flex items-center justify-between",
                "-m-3 rounded-md px-3.5 py-1.5",
                "transition-all duration-300",
                "bg-gradient-to-r from-zinc-100 via-zinc-100 to-zinc-100",
                "dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800",
                "hover:from-0% hover:from-orange-500/10 hover:via-100% hover:via-orange-500/5 hover:to-100% hover:to-transparent",
                "dark:hover:from-0% dark:hover:from-orange-500/20 dark:hover:via-100% dark:hover:via-orange-500/10 dark:hover:to-100% dark:hover:to-transparent",
                "hover:scale-[1.02] hover:cursor-pointer",
              )}
            >
              <p className="text-xs">
                Source:{" "}
                {source && source.length > 0 ? (
                  source.slice(0, 2).map((n, i) => (
                    <span key={n}>
                      {i > 0 && ", "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPage(n);
                        }}
                        className="underline underline-offset-2 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        Page {n}
                      </button>
                    </span>
                  ))
                ) : (
                  "N/A"
                )}
              </p>
              <div className="group/icon relative">
                <div
                  className={cn(
                    "absolute inset-[-6px] rounded-lg transition-all duration-300",
                    "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent",
                    "scale-90 opacity-0 group-hover/start:scale-100 group-hover/start:opacity-100",
                  )}
                />
                <ArrowRight className="relative z-10 h-4 w-4 text-orange-500 transition-all duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale {
          0% {
            transform: scale(2);
            opacity: 0;
            box-shadow: 0px 0px 50px rgba(255, 165, 0, 0.5);
          }
          50% {
            transform: translate(0px, -5px) scale(1);
            opacity: 1;
            box-shadow: 0px 8px 20px rgba(255, 165, 0, 0.5);
          }
          100% {
            transform: translate(0px, 5px) scale(0.1);
            opacity: 0;
            box-shadow: 0px 10px 20px rgba(255, 165, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
