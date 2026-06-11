"use client";

import { TCardDataProps } from "@/components/home/sections-stack";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"] });

export const CurlyArrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 80"
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

const SCROLL_TIMEOUT_OFFSET = 100;
const MIN_SCROLL_INTERVAL = 300;
const SCROLL_THRESHOLD = 20;
const TOUCH_ADVANCE_THRESHOLD = 24;
const SCALE_FACTOR = 0.08;
const MIN_SCALE = 0.08;
const MAX_SCALE = 2;
const HOVER_SCALE_MULTIPLIER = 1.02;
const CARD_PADDING = 100;

export interface ScrollableCardStackProps {
  cardHeight?: number;
  className?: string;
  items: TCardDataProps[];
  perspective?: number;
  transitionDuration?: number;
  /**
   * Optional content (e.g. heading) rendered above the cards but INSIDE the
   * scroll-capture region, so scrolling over it also advances the cards instead
   * of scrolling past the section.
   */
  header?: React.ReactNode;
}

const ScrollableCardStack: React.FC<ScrollableCardStackProps> = ({
  items,
  cardHeight = 384,
  perspective = 1000,
  transitionDuration = 180,
  className,
  header,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);
  const lastScrollTime = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  // Calculate the total number of items
  const totalItems = items.length;
  const maxIndex = totalItems - 1;

  // Constants for visual effects - matching reference code exactly
  const FRAME_OFFSET = -30;
  const FRAMES_VISIBLE_LENGTH = 3;
  const SNAP_DISTANCE = 50;

  // Clamp function from reference code - memoized to prevent recreation
  const clamp = useCallback(
    (val: number, [min, max]: [number, number]): number =>
      Math.min(Math.max(val, min), max),
    []
  );

  // Controlled scroll function to move exactly one card
  const scrollToCard = useCallback(
    (direction: 1 | -1) => {
      if (isScrolling) {
        return;
      }

      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll < MIN_SCROLL_INTERVAL) {
        return;
      }

      const newIndex = clamp(currentIndex + direction, [0, maxIndex]);

      if (newIndex !== currentIndex) {
        lastScrollTime.current = now;
        setIsScrolling(true);
        setCurrentIndex(newIndex);
        scrollY.set(newIndex * SNAP_DISTANCE);

        setTimeout(() => {
          setIsScrolling(false);
        }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
      }
    },
    [currentIndex, maxIndex, scrollY, isScrolling, transitionDuration, clamp]
  );

  // Handle scroll events with improved responsiveness
  const handleScroll = useCallback(
    (deltaY: number) => {
      if (isDragging || isScrolling) {
        return;
      }

      if (Math.abs(deltaY) < SCROLL_THRESHOLD) {
        return;
      }

      const scrollDirection = deltaY > 0 ? 1 : -1;
      scrollToCard(scrollDirection);
    },
    [isDragging, isScrolling, scrollToCard]
  );

  // Handle wheel events
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const scrollDirection = e.deltaY > 0 ? 1 : -1;
      
      // Allow native page scrolling if we are at the boundaries
      if (
        (scrollDirection === -1 && currentIndex === 0) ||
        (scrollDirection === 1 && currentIndex === maxIndex)
      ) {
        if (!isScrolling) {
          return;
        }
      }

      e.preventDefault();
      handleScroll(e.deltaY);
    },
    [handleScroll, currentIndex, maxIndex, isScrolling]
  );

  // Handle keyboard navigation - improved with reference code logic
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isScrolling) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "ArrowLeft": {
          e.preventDefault();
          scrollToCard(-1);
          break;
        }
        case "ArrowDown":
        case "ArrowRight": {
          e.preventDefault();
          scrollToCard(1);
          break;
        }
        case "Home": {
          e.preventDefault();
          if (currentIndex !== 0) {
            setIsScrolling(true);
            setCurrentIndex(0);
            scrollY.set(0);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        }
        case "End": {
          e.preventDefault();
          if (currentIndex !== maxIndex) {
            setIsScrolling(true);
            setCurrentIndex(maxIndex);
            scrollY.set(maxIndex * SNAP_DISTANCE);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        }
        default: {
          // No action for other keys
          break;
        }
      }
    },
    [
      currentIndex,
      maxIndex,
      scrollY,
      isScrolling,
      scrollToCard,
      transitionDuration,
    ]
  );

  // Handle touch events for mobile
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartIndex = useRef(0);
  const touchStartTime = useRef(0);
  const touchMoved = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchStartIndex.current = currentIndex;
      touchStartTime.current = Date.now();
      touchMoved.current = false;
      setIsDragging(true);
    },
    [currentIndex]
  );

  // Native (non-passive) touch handler so a normal swipe advances one card and
  // is prevented from scrolling the page past the section — mirroring the wheel
  // behavior on desktop. At the first/last card the lock is released so the page
  // scrolls away normally, and horizontal swipes are left alone (so carousels
  // inside a card keep working).
  const handleTouchMoveNative = useCallback(
    (e: TouchEvent) => {
      if (isScrolling) {
        return;
      }

      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      const deltaY = touchStartY.current - touch.clientY;
      const deltaX = touchStartX.current - touch.clientX;

      // Ignore mostly-horizontal gestures (let inner carousels handle them).
      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY === 0) {
        return;
      }

      const scrollDirection: 1 | -1 = deltaY > 0 ? 1 : -1;

      // Release the lock at the boundaries so the user can leave the section.
      if (
        (scrollDirection === -1 && currentIndex === 0) ||
        (scrollDirection === 1 && currentIndex === maxIndex)
      ) {
        return;
      }

      // Lock the section to card navigation and advance one card per swipe.
      e.preventDefault();
      if (!touchMoved.current && Math.abs(deltaY) > TOUCH_ADVANCE_THRESHOLD) {
        scrollToCard(scrollDirection);
        touchMoved.current = true;
      }
    },
    [isScrolling, currentIndex, maxIndex, scrollToCard]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchMoved.current = false;
  }, []);

  // Set up event listeners on the whole section so scrolling anywhere over it
  // (header, cards, and the empty space around them) advances the cards.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("touchmove", handleTouchMoveNative, {
      passive: false,
    });

    return () => {
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("touchmove", handleTouchMoveNative);
    };
  }, [handleWheel, handleTouchMoveNative]);

  // Snap to current index when not dragging
  useEffect(() => {
    if (!isDragging) {
      scrollY.set(currentIndex * SNAP_DISTANCE);
    }
  }, [currentIndex, isDragging, scrollY]);

  // Calculate transform for each card based on the reference code
  const getCardTransform = useCallback(
    (index: number) => {
      const offsetIndex = index - currentIndex;

      // Apply blur effect for cards behind the current one - matching reference exactly
      const isBehindCurrent = currentIndex > index;
      const blur = !shouldReduceMotion && isBehindCurrent ? 2 : 0;

      // Opacity based on distance - improved logic from reference
      const opacity = currentIndex > index ? 0 : 1;

      // Scale with improved calculation inspired by reference - using clamp function
      const scale = shouldReduceMotion
        ? 1
        : clamp(1 - offsetIndex * SCALE_FACTOR, [MIN_SCALE, MAX_SCALE]);

      // Vertical offset with improved calculation - matching reference exactly
      const y = shouldReduceMotion
        ? 0
        : clamp(offsetIndex * FRAME_OFFSET, [
            FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
            Number.POSITIVE_INFINITY,
          ]);

      // Z-index for proper layering - matching reference pattern
      const zIndex = items.length - index;

      return {
        y,
        scale,
        opacity,
        blur,
        zIndex,
      };
    },
    [currentIndex, items.length, clamp, shouldReduceMotion]
  );

  return (
    <section
      aria-atomic="true"
      aria-label="Scrollable card stack"
      aria-live="polite"
      className={cn("relative mx-auto h-fit", className)}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      ref={sectionRef}
    >
      {header && <div className="w-full">{header}</div>}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Interactive scrollable widget requires event handlers */}
      <div
        aria-label="Scrollable card container"
        className="h-full w-full"
        onKeyDown={handleKeyDown}
        ref={containerRef}
        role="application"
        style={{
          minHeight: `${cardHeight + CARD_PADDING}px`, // Add some padding for the card stack effect
          perspective: `${perspective}px`,
          perspectiveOrigin: "center 60%",
        }}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Required for keyboard navigation
        tabIndex={0}
      >
        {items.map((item, i) => {
          const transform = getCardTransform(i);
          const isActive = i === currentIndex;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { x: "-50%" }
                  : {
                      y: `calc(-50% + ${transform.y}px)`,
                      scale: transform.scale,
                      x: "-50%",
                    }
              }
              aria-hidden={!isActive}
              className="absolute top-1/2 left-1/2 w-full max-w-5xl min-w-[300px] rounded-none md:rounded-2xl border-0 md:border bg-background shadow-lg"
              data-active={isActive}
              initial={false}
              key={`scrollable-card-${item.id}`}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => isActive && setHoveredIndex(i)}
              onMouseEnter={() => isActive && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                height: `${cardHeight}px`,
                zIndex: transform.zIndex,
                pointerEvents: isActive ? "auto" : "none",
                transformOrigin: "center center",
                willChange: shouldReduceMotion
                  ? undefined
                  : "opacity, filter, transform",
                filter: `blur(${transform.blur}px)`,
                opacity: transform.opacity,
                transitionProperty: shouldReduceMotion
                  ? "none"
                  : "opacity, filter",
                transitionDuration: shouldReduceMotion ? "0ms" : "200ms",
                transitionTimingFunction:
                  "cubic-bezier(0.645, 0.045, 0.355, 1)",
                // Dynamic border width based on scale - from reference code
                borderWidth: `${1 / transform.scale}px`,
              }}
              tabIndex={isActive ? 0 : -1}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      type: "spring" as const,
                      stiffness: 250,
                      damping: 20,
                      mass: 0.5,
                      duration: 0.25,
                    }
              }
              whileHover={
                // Scaling removed to prevent text blurring on hover
                {}
              }
            >
              {/* Responsive Stylized Handwriting Caption */}
              {item.caption && (
                <div
                  className={cn(
                    "absolute -top-28 right-0 md:-top-24 md:right-4 lg:-top-28 lg:-right-10 flex items-end gap-1 md:gap-2 text-gray-800 z-50 pointer-events-none transition-opacity duration-300",
                    caveat.className,
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                >
                  <CurlyArrow className="text-zinc-500 dark:text-zinc-300 w-4 h-4 md:w-8 md:h-8 lg:w-8 lg:h-8 mt-16" />
                  <span className="text-lg dark:text-white md:text-xl lg:text-2xl translate-y-2 md:translate-y-0 tracking-wide">
                    {item.caption}
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div
                className={cn(
                  "flex w-full flex-col rounded-xl overflow-hidden bg-background transition-all duration-200",
                  isHovered && "shadow-xl",
                  isScrolling && isActive && "ring-2 ring-brand ring-opacity-50"
                )}
                style={{ height: `${cardHeight}px` }}
              >
                {/* Scroll indicator */}
                {isScrolling && isActive && (
                  <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-brand opacity-75" />
                )}

                {/* Content Container - takes remaining space */}
                <div className="relative w-full flex-1 overflow-hidden overflow-y-auto">
                  {/* Content */}
                  {item.content}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Navigation indicators */}
        <div
          aria-label="Card navigation"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2"
          role="tablist"
        >
          {Array.from({ length: items.length }, (_, i) => (
            <motion.button
              aria-label={`Go to card ${i + 1} of ${items.length}`}
              aria-selected={i === currentIndex}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-brand focus:ring-offset-1",
                i === currentIndex
                  ? "scale-125 bg-brand"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              key={`scrollable-indicator-${items[i]?.id || i}`}
              onClick={() => {
                if (i !== currentIndex && !isScrolling) {
                  setIsScrolling(true);
                  setCurrentIndex(i);
                  scrollY.set(i * SNAP_DISTANCE);
                  setTimeout(() => {
                    setIsScrolling(false);
                  }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
                }
              }}
              role="tab"
              transition={{
                type: "spring" as const,
                stiffness: 250,
                damping: 20,
                mass: 0.5,
              }}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Instructions for screen readers */}
        <div aria-live="polite" className="sr-only">
          {`Card ${currentIndex + 1} of ${items.length} selected. Use arrow keys to navigate one card at a time, or click the dots below.`}
        </div>
      </div>
    </section>
  );
};

export default ScrollableCardStack;
