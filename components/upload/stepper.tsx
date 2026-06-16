"use client";

import {useState} from "react";
import {Badge} from "@/components/reui/badge";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import {PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  IconCheck,
  IconCreditCard,
  IconLoader2,
  IconLock,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import {MdOutlineCancel} from "react-icons/md";

const steps = [
  {
    title: "User Details",
    icon: <IconUserSquareRounded className="size-4" />,
  },
  {
    title: "Payment Info",
    icon: <IconCreditCard className="size-4" />,
  },
  {
    title: "Auth OTP",
    icon: <IconLock className="size-4" />,
  },
];

import {useIsMobile} from "@/hooks/use-mobile";

export type StepperStep = {
  title: string;
  icon: React.ReactNode;
  content: string;
};

export function UploadStepper({
  steps,
  currentStep,
  onCancel,
}: {
  steps: StepperStep[];
  currentStep: number;
  onCancel?: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full w-full justify-start mt-1 md:mt-0 md:justify-center items-center">
      <Stepper
        value={currentStep}
        onValueChange={() => {}}
        orientation={isMobile ? "vertical" : "horizontal"}
        indicators={{
          completed: <IconCheck className="size-3.5" />,
          loading: <IconLoader2 className="size-3.5 animate-spin" />,
        }}
        className="w-full mx:auto md:mx-0 max-w-4xl space-y-8"
      >
        <StepperNav className="gap-6 md:gap-3 overflow-x-auto overflow-y-auto thin-scrollbar pb-2">
          {steps.map((step, index) => (
            <StepperItem
              key={index}
              step={index + 1}
              className="relative flex-1 items-start shrink-0 md:min-w-[120px]"
            >
              <StepperTrigger
                className="flex grow flex-row md:flex-col items-center md:items-start justify-start md:justify-center gap-4 md:gap-2.5 pointer-events-none"
                asChild
              >
                <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-transparent shrink-0">
                  {step.icon}
                </StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <div className="text-muted-foreground text-[8px] md:text-[10px] font-semibold uppercase">
                    Step {index + 1}
                  </div>
                  <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-sm md:text-base font-semibold whitespace-nowrap">
                    {step.title}
                  </StepperTitle>
                  <div>
                    <Badge
                      size="sm"
                      variant="primary-light"
                      className="rounded-xs md:rounded-sm hidden group-data-[state=active]/step:inline-flex"
                    >
                      In Progress
                    </Badge>
                    <Badge
                      variant="success-light"
                      size="sm"
                      className="rounded-xs md:rounded-sm hidden group-data-[state=completed]/step:inline-flex"
                    >
                      Completed
                    </Badge>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="rounded-xs md:rounded-sm text-muted-foreground hidden group-data-[state=inactive]/step:inline-flex"
                    >
                      Pending
                    </Badge>
                  </div>
                </div>
              </StepperTrigger>

              {steps.length > index + 1 && (
                <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute md:inset-x-0 md:start-9 md:top-4 md:m-0 md:w-[calc(100%-2rem)] md:h-0.5 inset-y-0 start-[15px] top-9 h-[calc(100%+1.5rem)] w-0.5 m-0 flex-none" />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className="text-sm">
          {steps.map((step, index) => (
            <StepperContent
              key={index}
              value={index + 1}
              className="flex items-center justify-center p-4 md:p-8"
            >
              <div className="flex items-center gap-3">
                <IconLoader2 className="size-6 animate-spin text-primary" />
                <span className="font-medium md:font-semibold text-muted-foreground text-base md:text-lg">
                  {step.content}
                </span>
              </div>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
      <div>
        <Button
          size={"lg"}
          variant={"outline"}
          className="rounded-xs md:rounded-full w-full shadow-md"
          onClick={onCancel}
          disabled={!onCancel}
        >
          <MdOutlineCancel /> Cancel
        </Button>
      </div>
    </div>
  );
}
