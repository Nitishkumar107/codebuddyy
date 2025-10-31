// components/dialogs/delete-dialog.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import * as React from "react"

interface DeleteDialogProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    onConfirm: () => void
    title: string
    description: string
    itemName: string
    confirmLabel?: string
    cancelLabel?: string
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ 
    isOpen, 
    setIsOpen, 
    onConfirm,
    title,
    description,
    itemName,
    confirmLabel = "Delete",
    cancelLabel = "Cancel"
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteDialog
