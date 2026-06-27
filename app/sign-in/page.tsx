import { AuthButton } from "@/components/common/authbutton";
import { signIn } from "@/utils/auth";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function LoginPage() {
  return (
    <section className="flex min-h-screen w-full">
      {/* Left visual panel — hidden on mobile */}
      <div className="relative hidden overflow-hidden md:flex md:w-[43%]">
        <Image
          src="https://picsum.photos/id/1018/1600/2000"
          alt="DocuMind"
          fill
          priority
          sizes="(min-width: 768px) 40vw, 0px"
          className="object-cover"
        />
        {/* brand-tinted overlay for depth + text contrast */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-900/45 to-blue-900/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 lg:p-14">
          <blockquote className="max-w-2xl">
            <p className="text-xl font-medium text-white lg:text-2xl">
              &ldquo;The art of reading is to skip judiciously.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-white/70">— Philip Hamerton</footer>
          </blockquote>
        </div>
      </div>

      {/* Right form panel (the only block shown on mobile) */}
      <div className="flex w-full flex-col bg-zinc-50 dark:bg-background md:w-[57%]">
        {/* Top bar: small logo (left) + back button (right), set a bit lower from the top */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 md:px-10 md:pt-10">
          <Link href="/" aria-label="DocuMind home" className="flex items-center">
            <Image
              className="block h-6 w-auto dark:hidden"
              src="/teach-4.png"
              alt="DocuMind"
              width={105}
              height={28}
              priority
            />
            <Image
              className="hidden h-5 w-auto dark:block"
              src="/darklogo.png"
              alt="DocuMind"
              width={104}
              height={28}
              priority
            />
          </Link>
          <Link
            href="/"
            aria-label="Back to home"
            className="flex size-9 items-center justify-center rounded-full bg-gradient-to-b from-blue-100 to-white text-blue-600 shadow-md ring-1 ring-blue-200/70 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 dark:from-blue-900/40 dark:to-zinc-900 dark:text-blue-300 dark:ring-blue-800/50"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-0 pb-10 md:px-8">
          <div className="mx-auto w-full max-w-[98%] px-4 md:max-w-sm md:px-0">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl font-medium tracking-tight">
                Welcome to DocuMind
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to continue to your study workspace.
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <AuthButton />
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground md:text-left">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
