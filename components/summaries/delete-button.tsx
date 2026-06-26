'use client'

import { Archive, DeleteIcon, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
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
import { useState, useTransition } from "react";
import { deleteSummaryAction } from "@/actions/summary-actions";
import { toast } from "sonner";

interface deleteButtonProps {
    summaryId : string
}
export default function DeleteButton({summaryId} : deleteButtonProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async() => {
        startTransition(async() => {
            const result = await deleteSummaryAction({summaryId})
            if(!result) {
                toast("Error", {
                    description: "failed to delete summary"
                })
            }
            setOpen(false)
        })
    }
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button variant={'ghost'} className="text-gray-500 bg-gray-50 border border-gray-200 hover:text-blue-400" >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose>
                        <Button variant={'ghost'} className="bg-gray-50 border border-gray-200 hover:text-gray-600 hover:bg-gray-100" >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button className="bg-blue-400 border border-blue-400 hover:text-white hover:bg-gray-100" onClick={handleDelete} >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
            
        </div>
    )
}