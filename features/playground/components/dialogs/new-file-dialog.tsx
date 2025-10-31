// components/dialogs/new-file-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

interface NewFileDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateFile: (filename: string, extension: string) => void
}

const NewFileDialog: React.FC<NewFileDialogProps> = ({ 
    isOpen, 
    onClose, 
    onCreateFile 
}) => {
    const [filename, setFilename] = React.useState("")
    const [extension, setExtension] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (filename.trim() && extension.trim()) {
            onCreateFile(filename.trim(), extension.trim())
            setFilename("")
            setExtension("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="filename" className="text-right">
                                File Name
                            </Label>
                            <Input
                                id="filename"
                                value={filename
                                }
                                onChange={(e) => setFilename(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="extension" className="text-right">
                                Extension
                            </Label>
                            <Input
                                id="extension"
                                value={extension}
                                onChange={(e) => setExtension(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create File</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default NewFileDialog
