"use client";

import Link from "next/link";
import React from "react";
import {cn} from "@/lib/utils";
import {useScroll} from "motion/react";
import {usePathname} from "next/navigation";
import {AnimatedThemeToggler} from "../ui/animated-theme-toggler";
import {sans} from "@/lib/fonts";
import Image from "next/image";
import UserAccountAvatar from "@/components/smoothui/user-account-avatar";
import { signOut } from "next-auth/react";

export const Navbar = ({user}: {user?: any}) => {
  const pathname = usePathname();
  const {scrollYProgress} = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <header>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-200 ",
          scrolled && "bg-white/80 dark:bg-black/20 backdrop-blur-5xl",
        )}
      >
        <div className="w-full px-3.5 md:px-0 pt-5">
          <div className="mx-auto max-w-full md:max-w-3xl">
            <div className="flex items-center justify-between gap-3 py-3 lg:py-4">
              <div className="flex items-center gap-10 md:gap-16">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center grayscale-0 md:grayscale-50"
                >
                  <Image
                    className="hidden md:block dark:hidden items-center grayscale-0 md:grayscale-50 scale-x-70 md:scale-x-100"
                    src={
                      "/teach-4.png"
                    }
                    alt="logo"
                    width={100}
                    height={100}
                  />
                  <Image
                    className="hidden md:dark:block items-center grayscale-0 md:grayscale-50 scale-x-70 md:scale-x-100"
                    src={
                      "/darklogo.png"
                    }
                    alt="logo"
                    width={95}
                    height={95}
                  />
                  
                  {/* <Image
                    className=""
                    src={
                      "/mobile-logo-light.png"
                    }
                    alt="logo"
                    width={50}
                    height={40}
                  /> */}
                  <div className="flex md:hidden dark:hidden items-center">
                    <Image
                    className="aspect-square"
                    src={
                      "/teach-8.png"
                    }
                    alt="logo"
                    width={40}
                    height={40}
                  />
                  </div>
                  <div className="hidden dark:flex md:dark:hidden items-center">
                    <Image
                    className="aspect-square"
                    src={
                      "/teach-5.png"
                    }
                    alt="logo"
                    width={40}
                    height={40}
                  />
                  </div>
                  {/* <Image
                    className="hidden dark:block md:dark:hidden items-center grayscale-0 md:grayscale-50 scale-x-70 md:scale-x-100"
                    src={
                      "/mobile-logo-dark.png"
                    }
                    alt="logo"
                    width={50}
                    height={40}
                  /> */}
                </Link>

                <ul className="flex gap-3 sm:gap-4 md:gap-8 text-[12.5px] md:text-sm">
                  {user && (
                    <>
                      <li className="relative pb-1">
                        <Link
                          href="/dashboard"
                          className={cn(
                            "group relative block transition-colors duration-150",
                            sans.className,
                            pathname === "/dashboard"
                              ? "font-semibold"
                              : "hover:text-accent-foreground",
                          )}
                        >
                          <span>Dashboard</span>
                          <span
                            className={cn(
                              "absolute left-0 -bottom-1 h-[1.5px] w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100",
                              pathname === "/dashboard" && "scale-x-100",
                            )}
                          />
                        </Link>
                      </li>
                      <li className="relative pb-1">
                        <Link
                          href="/upload"
                          className={cn(
                            "group relative block transition-colors duration-150",
                            sans.className,
                            pathname === "/upload"
                              ? "font-semibold"
                              : "hover:text-accent-foreground",
                          )}
                        >
                          <span>Upload PDF</span>
                          <span
                            className={cn(
                              "absolute left-0 -bottom-1 h-[1.5px] w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100",
                              pathname === "/upload" && "scale-x-100",
                            )}
                          />
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0 pb-1">
                {user ? (
                  <div className="flex items-center gap-1">
                    {user?.user && (
                      <UserAccountAvatar
                        className="h-8 w-8 overflow-hidden"
                        user={{
                          name: user.user.name || "User",
                          email: user.user.email || "",
                          avatar: user.user.image || "",
                        }}
                        onLogout={() => signOut()}
                      />
                    )}
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="text-[12.5px] md:text-sm font-medium hover:text-foreground/80 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                <AnimatedThemeToggler />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
