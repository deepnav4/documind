import {sans} from "@/lib/fonts";
import {Twitter, Linkedin, Facebook, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import {FaXTwitter} from "react-icons/fa6";
import {FaLinkedinIn} from "react-icons/fa";
import {MdEmail} from "react-icons/md";

export default function Footer() {
  return (
    <footer className="relative w-full bg-linear-to-b from-blue-600 to-blue-700 overflow-hidden pt-24 md:pt-32 pb-5 md:pb-10 mt-24">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
                        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                    `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col items-center">
        <h1 className="text-[75px] sm:text-[90px] md:text-[150px] lg:text-[230px] font-bold bg-linear-to-b from-white/50 to-white/0 bg-clip-text text-transparent leading-[0.8] tracking-tighter select-none pb-2 md:pb-12 w-full text-center">
          documind
        </h1>

        <div className="w-full flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-blue-500/50">
          <div className="flex items-center gap-4 text-blue-200 mb-6 md:mb-0">
            <Link
              href="/upload"
              className="hover:text-white bg-blue-500/50 hover:bg-blue-400/30 transition-colors p-2 rounded-full border border-blue-400/20"
            >
              <FaXTwitter className="w-4 h-4" />
            </Link>
            <Link
              href="/upload"
              className="hover:text-white bg-blue-500/50 hover:bg-blue-400/30 transition-colors p-2 rounded-full border border-blue-400/20"
            >
              <FaLinkedinIn className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="hover:text-white bg-blue-500/50 hover:bg-blue-400/30 transition-colors p-2 rounded-full border border-blue-400/20"
            >
              <MdEmail className="w-4 h-4" />
            </Link>
          </div>

          <div
            className={`${sans.className} flex flex-wrap items-center justify-center text-xs text-blue-200`}
          >
            © {new Date().getFullYear()} DocuMind. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
