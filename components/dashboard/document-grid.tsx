"use client";

import {useState, useEffect} from "react";
import {Badge} from "@/components/reui/badge";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable";
import {IconGripVertical} from "@tabler/icons-react";
import {FileTextIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {formatDistanceToNow} from "date-fns";
import {useRouter} from "next/navigation";
import {PiFilePdf} from "react-icons/pi";
import {FaRegFilePdf} from "react-icons/fa6";
import {FaFilePdf} from "react-icons/fa6";
import {BsFiletypePdf} from "react-icons/bs";
import {FaLocationArrow} from "react-icons/fa6";
import {IoIosArrowRoundForward} from "react-icons/io";
import {Separator} from "../ui/separator";
import {AiOutlineDelete} from "react-icons/ai";
import { DeleteProjectDialog } from "./delete-project";
import { EmptyState } from "../individual-project/empty-state";
import { TbCardsFilled } from "react-icons/tb";

export type TDocumentDashboardItem = {
  id: string;
  file_name: string | null;
  file_size: string | null;
  created_at: Date;
  _count: {chunks: number};
  generated_content: {feature_type: string}[];
};

export function DocumentGrid({
  initialDocuments,
}: {
  initialDocuments: TDocumentDashboardItem[];
}) {
  const [items, setItems] =
    useState<TDocumentDashboardItem[]>(initialDocuments);
  const router = useRouter();

  useEffect(() => {
    setItems(initialDocuments);
  }, [initialDocuments]);

  const handleValueChange = (newItems: TDocumentDashboardItem[]) => {
    setItems(newItems);
  };

  const getItemValue = (item: TDocumentDashboardItem) => item.id;

  const renderBadges = (item: TDocumentDashboardItem) => {
    const hasChat = item._count.chunks > 0;
    const contentTypes = item.generated_content.map((g) =>
      g.feature_type.toLowerCase(),
    );

    const hasFlashcards =
      contentTypes.includes("flashcard") || contentTypes.includes("flashcards");
    const hasQuiz = contentTypes.includes("quiz");
    const hasMindMap = contentTypes.includes("mindmap");

    return (
      <div className="flex flex-wrap gap-1">
        {hasChat && (
          <Badge
            variant="primary-light"
            size="xs"
            className="rounded-none md:rounded-sm bg-green-100/60 font-normal text-green-700/70 dark:bg-green-900/50 dark:text-green-500/90"
          >
            Chat
          </Badge>
        )}
        {hasFlashcards && (
          <Badge
            variant="success-light"
            size="xs"
            className="rounded-none md:rounded-sm bg-green-100/60 font-normal text-green-700/70 dark:bg-green-900/50 dark:text-green-500/90"
          >
            Flashcards
          </Badge>
        )}
        {hasQuiz && (
          <Badge
            variant="warning-light"
            size="xs"
            className="rounded-none md:rounded-sm bg-yellow-100/60 font-normal text-yellow-700/70 dark:bg-yellow-900/50 dark:text-yellow-500/90"
          >
            Quiz
          </Badge>
        )}
        {hasMindMap && (
          <Badge
            variant="info-light"
            size="xs"
            className="rounded-none md:rounded-sm bg-blue-100/60 font-normal text-blue-700/70 dark:bg-blue-900/50 dark:text-blue-500/90"
          >
            Mind Map
          </Badge>
        )}

        {!hasChat && !hasFlashcards && !hasQuiz && !hasMindMap && (
          <Badge variant="secondary" size="sm">
            Processing...
          </Badge>
        )}
      </div>
    );
  };

  const getFormattedDate = (date: Date) => {
    try {
      const distance = formatDistanceToNow(new Date(date), {addSuffix: true});
      return distance.charAt(0).toUpperCase() + distance.slice(1);
    } catch (e) {
      return "";
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BsFiletypePdf className="text-blue-500" />}
        title="No Documents"
        description="You have no documents yet. Upload a PDF to get started!"
        buttonText="Upload PDF"
        executeOnClick={() => {
          router.push("/upload");
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl pt-4">
      <Sortable
        value={items}
        onValueChange={handleValueChange}
        getItemValue={getItemValue}
        strategy="grid"
        className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div
              className={cn(
                "rounded-xs md:rounded-md group dark:shadow-zinc-950 shadow-sm hover:shadow-md relative bg-slate-50 dark:bg-zinc-950 border-border hover:bg-accent/50 dark:hover:bg-accent/95 cursor-pointer border p-4 transition-all duration-200 ease-in-out flex flex-col justify-between min-h-[150px]",
              )}
              onClick={() => {
                router.push(`/dashboard/${item.id}`);
              }}
            >
              <div className="absolute end-2 top-2 z-10 flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                <DeleteProjectDialog
                  documentId={item.id}
                  documentName={item.file_name || "Untitled Document"}
                  onDelete={(id) => {
                    setItems((prev) => prev.filter((doc) => doc.id !== id));
                  }}
                >
                  <button
                    type="button"
                    className="hover:cursor-pointer p-1.5 pr-0 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AiOutlineDelete className="h-[15px] w-[15px]" />
                  </button>
                </DeleteProjectDialog>
                <SortableItemHandle className="p-1.5 pl-0 text-muted-foreground hover:text-foreground transition-colors">
                  <IconGripVertical className="h-4 w-4" />
                </SortableItemHandle>
              </div>

              <div className="flex items-center gap-3">
                <div className="">
                  <div className="flex items-center justify-center p-1.5 rounded-sm bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800/30 shrink-0">
                    <PiFilePdf className="size-5 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pe-4">
                  <h4 className="truncate text-sm font-medium">
                    {item.file_name || "Untitled Document"}
                  </h4>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    PDF Document • {item.file_size || "Unknown Size"}
                  </p>
                </div>
              </div>
              <div>
                <Separator className="mb-1.5 opacity-80" />
                <div className="flex items-end justify-between gap-2">
                  {renderBadges(item)}

                  <div className="flex items-end gap-1 shrink-0">
                    <span className="text-[10px] font-medium text-muted-foreground/60">
                      {getFormattedDate(item.created_at)} •
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      View{" "}
                      <span aria-hidden="true">
                        <IoIosArrowRoundForward />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}
