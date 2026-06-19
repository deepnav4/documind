"use client"

import { Button } from "@/components/ui/button"
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
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from "react"
import { toast } from "sonner"

import { deletePdfFile } from "@/actions/upload-actions"

export function DeleteProjectDialog({ 
  documentId, 
  documentName, 
  onDelete, 
  children 
}: { 
  documentId: string;
  documentName: string;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from clicking
    setIsDeleting(true);

    try {
      const res = await deletePdfFile(documentId);
      
      if (!res.success) {
        toast.error(res.message || "Failed to delete project");
        return;
      }
      
      toast.success(`"${documentName}" has been completely removed.`);
      onDelete(documentId);
      setOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred deleting the project.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* We stop propagation on the content so clicking inside the modal doesn't trigger the card routing */}
      <DialogContent onClick={(e) => e.stopPropagation()} className="rounded-xs md:rounded-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 text-destructive rounded-md flex size-10 shrink-0 items-center justify-center">
              <IconAlertTriangle className="size-5" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Delete Project?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{documentName}</span>? 
                This action cannot be undone and will remove all associated chat context, quizzes, and flashcards.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xs md:rounded-md" onClick={(e) => e.stopPropagation()}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" className="rounded-xs md:rounded-md" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
