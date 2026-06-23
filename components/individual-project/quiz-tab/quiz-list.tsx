"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable"
import { GripVerticalIcon } from "lucide-react"
import { SiQuizlet } from "react-icons/si"
import { AiOutlineDelete } from "react-icons/ai"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"
import { deleteGeneratedContent } from "@/actions/upload-actions"

export interface QuizItem {
  id: string
  title: string
  date: string
  attempted: boolean
  score?: number
  total?: number
}

interface QuizListProps {
  initialItems: QuizItem[];
  onQuizSelect: (id: string) => void;
  onDeleteQuiz?: (id: string) => void;
}

function DeleteQuizDialog({ 
  contentId, 
  contentName, 
  onDelete, 
  children 
}: { 
  contentId: string;
  contentName: string;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      const res = await deleteGeneratedContent(contentId);
      
      if (!res.success) {
        toast.error(res.message || "Failed to delete quiz");
        return;
      }
      
      toast.success("Quiz deleted successfully.");
      onDelete(contentId);
      setOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 text-destructive rounded-md flex size-10 shrink-0 items-center justify-center">
              <IconAlertTriangle className="size-5" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Delete Quiz?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{contentName}</span>? 
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={(e) => e.stopPropagation()}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QuizList({ initialItems, onQuizSelect, onDeleteQuiz }: QuizListProps) {
  const [items, setItems] = useState<QuizItem[]>(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const handleValueChange = (newItems: QuizItem[]) => {
    setItems(newItems)
  }

  const getItemValue = (item: QuizItem) => item.id

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (onDeleteQuiz) {
      onDeleteQuiz(id);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-1.5 md:p-6">
      <Sortable
        value={items}
        onValueChange={handleValueChange}
        getItemValue={getItemValue}
        strategy="vertical"
        className="space-y-2"
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div
              className="bg-background border-border hover:bg-accent/50 rounded-xs md:rounded-md flex cursor-pointer items-center gap-3 border p-3 transition-colors"
              onClick={() => onQuizSelect(item.id)}
            >
              <SortableItemHandle className="text-muted-foreground hover:text-foreground">
                <GripVerticalIcon className="h-4 w-4" />
              </SortableItemHandle>

              <div className="text-muted-foreground flex items-center gap-2">
                <SiQuizlet className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium">{item.title}</h4>
                <p className="text-muted-foreground truncate text-xs">
                  {item.date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {item.attempted ? (
                  <Badge variant="default" className="bg-green-100 text-zinc-800 dark:text-muted-foreground flex items-center gap-2 rounded-full px-3 py-1 font-normal border-0 shadow-none">
                     Attempted 
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground flex items-center gap-2 rounded-full px-3 py-1 font-normal border-0 shadow-none">
                     Not Attempted
                  </Badge>
                )}
                
                <DeleteQuizDialog
                  contentId={item.id}
                  contentName={item.title}
                  onDelete={handleDelete}
                >
                  <button
                    type="button"
                    className="hover:cursor-pointer p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AiOutlineDelete className="h-[15px] w-[15px]" />
                  </button>
                </DeleteQuizDialog>
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}
