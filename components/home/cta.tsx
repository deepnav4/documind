import Link from "next/link";
import { Button } from "../ui/button";
import IconStack from "./iconstack";
import { Upload } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative w-full max-w-6xl mx-auto mt-24 md:mt-32 -mb-32 md:-mb-36 z-20 md:px-8">
      <div className="relative w-full bg-linear-to-t from-blue-100 to-transparent dark:from-blue-900 dark:to-transparent rounded-xl md:rounded-3xl overflow-hidden flex flex-row items-center justify-between px-4 py-6 md:px-24 md:py-0 min-h-[220px] md:min-h-[480px] shadow-sm">
        
        {/* Left Content */}
        <div className="flex flex-col gap-3 md:gap-6 text-left items-start z-10 w-[55%] shrink-0 py-0">
          <h1 className="font-bold text-2xl sm:text-3xl leading-tight md:text-5xl text-blue-800 dark:text-blue-100 tracking-tight">
            Understand
            <br className="block md:hidden" /> Anything
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs md:text-[17px] leading-relaxed max-w-md">
            Complex unstructured document having tables or
            <br className="hidden md:block" /> mathematical equations, are now easy to understand.
          </p>
          <div className="mt-2 md:mt-4 w-full sm:w-auto">
            <Link href="/upload" className="hidden md:block w-full sm:w-auto">
              <Button size={"default"} className="w-full sm:w-auto shadow-md bg-linear-to-t from-blue-700 via-blue-600 to-blue-400 hover:from-blue-600 hover:via-blue-500 hover:to-blue-300 rounded-xl hover:cursor-pointer text-xs md:text-base text-white">
                <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5" /> Upload PDF
              </Button>
            </Link>
            <Link href="/upload" className="md:hidden">
              <Button size={"sm"} className="shadow-md bg-linear-to-t from-blue-700 via-blue-600 to-blue-400 hover:from-blue-600 hover:via-blue-500 hover:to-blue-300 hover:cursor-pointer text-xs md:text-base text-white">
                <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5" /> Upload PDF
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Content - Floating Icons */}
        <div className="relative flex justify-end items-center mt-0 w-[45%] h-[220px] md:h-full shrink-0 scale-[0.45] sm:scale-[0.55] origin-right md:scale-95 pointer-events-none select-none">
          <div className="flex gap-4 md:gap-8 absolute md:right-[-20px]">
            <div className="flex flex-col translate-y-8 md:translate-y-12">
              <IconStack />
            </div>
            <div className="flex flex-col -translate-y-8 md:-translate-y-12">
              <IconStack />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
