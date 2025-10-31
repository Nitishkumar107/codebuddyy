// components/dialogs/new-folder-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

interface NewFolderDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateFolder: (folderName: string) => void
    }

    const NewFolderDialog: React.FC<NewFolderDialogProps> = ({ 
    isOpen, 
    onClose, 
    onCreateFolder 
    }) => {
    const [folderName, setFolderName] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (folderName.trim()) {
        onCreateFolder(folderName.trim())
        setFolderName("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folderName" className="text-right">
                    Folder Name
                </Label>
                <Input
                    id="folderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="col-span-3"
                    required
                />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                Cancel
                </Button>
                <Button type="submit">Create Folder</Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}

export default NewFolderDialog
