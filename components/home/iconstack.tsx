"use client";

import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Icon} from "lucide-react";
import {SiQuizlet} from "react-icons/si";
import {TbCardsFilled} from "react-icons/tb";
import { FcMindMap } from "react-icons/fc";
import { HiChatBubbleOvalLeft } from "react-icons/hi2";

type TIconsProps = {
  icon: React.ReactNode;
};
export default function IconStack() {
  const icons: TIconsProps[] = [
    {
      icon: <SiQuizlet className="size-10 text-blue-500" />,
    },
    {
      icon: <TbCardsFilled className="size-10 text-blue-500" />,
    },
    {
      icon: <FcMindMap className="size-10 text-blue-500" />,
    },
    {
      icon: <HiChatBubbleOvalLeft className="size-10 text-blue-500" />,
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 bg-transparent [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_70%,transparent)]",
      )}
    >
      {icons.map((icon, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className={cn(
            "w-22 h-22 rounded-full bg-white hover:scale-105 transition-transform",
          )}
        >
          <div>{icon.icon}</div>
        </Button>
      ))}
      <style jsx>{`
        .mask-gradient {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }
      `}</style>
    </div>
  );
}
