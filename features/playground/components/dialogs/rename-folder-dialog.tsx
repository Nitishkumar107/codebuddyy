// components/dialogs/rename-folder-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

interface RenameFolderDialogProps {
    isOpen: boolean
    onClose: () => void
    onRename: (newFolderName: string) => void
    currentFolderName: string
}

const RenameFolderDialog: React.FC<RenameFolderDialogProps> = ({ 
    isOpen, 
    onClose, 
    onRename,
    currentFolderName
}) => {
    const [newFolderName, setNewFolderName] = React.useState(currentFolderName)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newFolderName.trim()) {
            onRename(newFolderName.trim())
            setNewFolderName("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Folder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newFolderName" className="text-right">
                                New Folder Name
                            </Label>
                            <Input
                                id="newFolderName"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Rename Folder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default RenameFolderDialog
