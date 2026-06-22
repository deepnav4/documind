"use client";

import {useCallback, useEffect, useState} from "react";

import {cn} from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import CardFlip from "./flip-card";

interface FlashCardsCarouselProps {
  flashCards: any[];
}

export function FlashCardsCarousel({ flashCards = [] }: FlashCardsCarouselProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi],
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  if (!flashCards || flashCards.length === 0) {
    return <div className="text-center p-8">No flash cards available</div>;
  }

  return (
    <div className="flex w-full max-w-2xl items-center justify-center flex-col justify-self-center gap-0">
      <Carousel setApi={setMainApi} className="w-full">
        <CarouselContent>
          {flashCards.map((card, index) => (
            <CarouselItem key={index}>
              <div className="flex h-[400px] items-center justify-center rounded-xs md:rounded-md p-6">
                <CardFlip question={card.question} answer={card.answer} index={index} source={card.source} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Carousel
        setApi={setThumbApi}
        opts={{
          containScroll: "keepSnaps",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="flex-row">
          {flashCards.map((card, index) => (
            <CarouselItem
              key={index}
              className="basis-1/3 cursor-pointer pl-2 sm:basis-1/4 md:basis-1/5"
              onClick={() => onThumbClick(index)}
            >
              <div
                className={cn(
                  "rounded-sm md:rounded-lg relative flex aspect-video flex-col items-center justify-center overflow-hidden border p-2 text-center transition-all",
                  index === selectedIndex
                    ? "border-primary bg-primary/5 opacity-100 shadow-sm"
                    : "border-transparent bg-muted/50 opacity-50 hover:bg-muted hover:opacity-100",
                )}
              >
                <span className="line-clamp-2 text-xs font-semibold text-foreground rounded-full px-2 py-1 bg-orange-300">
                  {index + 1}
                </span>
                <span className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                  {card.question}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
