// components/dialogs/rename-file-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

interface RenameFileDialogProps {
    isOpen: boolean
    onClose: () => void
    onRename: (newFilename: string, newExtension: string) => void
    currentFilename: string
    currentExtension: string
}

const RenameFileDialog: React.FC<RenameFileDialogProps> = ({ 
    isOpen, 
    onClose, 
    onRename,
    currentFilename,
    currentExtension
}) => {
    const [newFilename, setNewFilename] = React.useState(currentFilename)
    const [newExtension, setNewExtension] = React.useState(currentExtension)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newFilename.trim() && newExtension.trim()) {
            onRename(newFilename.trim(), newExtension.trim())
            setNewFilename("")
            setNewExtension("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newFilename" className="text-right">
                                New File Name
                            </Label>
                            <Input
                                id="newFilename"
                                value={newFilename}
                                onChange={(e) => setNewFilename(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newExtension" className="text-right">
                                Extension
                            </Label>
                            <Input
                                id="newExtension"
                                value={newExtension}
                                onChange={(e) => setNewExtension(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Rename File</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default RenameFileDialog
