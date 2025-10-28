"use client"

import Image from "next/image"
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogContent } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Copy, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import { Project } from "../types"

interface ProjectTableProps {
    projects: Project[]
    onUpdateProject?: Function
    onDeleteProject?: Function
    onDuplicateProject?: Function
    onMarkasFavorite?: Function
}

interface EditProjectData {
    title: string
    description: string
}

export default function ProjectTable({ 
    projects, 
    onDeleteProject, 
    onDuplicateProject, 
    onUpdateProject, 
    onMarkasFavorite 
}: ProjectTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [editData, setEditData] = useState<EditProjectData>({ title: "", description: "" })
    const [isLoading, setIsLoading] = useState(false)

    const handleEditClick = (project: Project) => {
        setSelectedProject(project)
        setEditData({
            title: project.title,
            description: project.description || "",
        })
        setEditDialogOpen(true)
    }

    const handleDeleteClick = async (project: Project) => {
        setSelectedProject(project)
        setDeleteDialogOpen(true)
    }

    const handleUpdateProject = async () => {
        if (!selectedProject || !onUpdateProject) return
        setIsLoading(true)
        try {
            await onUpdateProject(selectedProject.id, editData)
            setEditDialogOpen(false)
            setSelectedProject(null)
            toast.success("Project updated successfully")
        } catch (error) {
            toast.error("Failed to update project")
            console.error("Error updating project:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleMarkasFavorite = async (project: Project) => {
        if (!onMarkasFavorite) return
        setIsLoading(true)
        try {
            await onMarkasFavorite(project.id)
            toast.success("Project marked as favorite successfully")
        } catch (error) {
            toast.error("Failed to mark project as favorite")
            console.error("Error marking project as favorite:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteProject = async () => {
        if (!selectedProject || !onDeleteProject) return
        setIsLoading(true)
        try {
            await onDeleteProject(selectedProject.id)
            setDeleteDialogOpen(false)
            setSelectedProject(null)
            toast.success("Project deleted successfully")
        } catch (error) {
            toast.error("Failed to delete project")
            console.error("Error deleting project:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDuplicateProject = async (project: Project) => {
        if (!onDuplicateProject) return
        setIsLoading(true)
        try {
            await onDuplicateProject(project.id)
            toast.success("Project duplicated successfully")
        } catch (error) {
            toast.error("Failed to duplicate project")
            console.error("Error duplicating project:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const copyProjectUrl = (projectId: string) => {
        const url = `${window.location.origin}/playground/${projectId}`
        navigator.clipboard.writeText(url)
        toast.success("Project URL copied to clipboard")
    }

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
            <div className="w-full">
                <Table>
                    <TableHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-emerald-700 font-semibold text-sm tracking-wide">Project</TableHead>
                            <TableHead className="text-emerald-700 font-semibold text-sm tracking-wide">Template</TableHead>
                            <TableHead className="text-emerald-700 font-semibold text-sm tracking-wide">Created</TableHead>
                            <TableHead className="text-emerald-700 font-semibold text-sm tracking-wide">User</TableHead>
                            <TableHead className="text-emerald-700 font-semibold text-sm tracking-wide w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            projects.map((project) => (
                                <TableRow 
                                    key={project.id} 
                                    className="hover:bg-emerald-50/50 transition-all duration-200 border-b border-emerald-100/50"
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Link 
                                                href={`/playground/${project.id}`} 
                                                className="hover:underline text-emerald-800 hover:text-emerald-900 transition-colors duration-200 font-medium"
                                            > 
                                                <span className="text-sm">{project.title}</span> 
                                            </Link> 
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge 
                                            variant='outline' 
                                            className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-colors duration-200 px-2 py-1 text-xs"
                                        > 
                                            {project.template} 
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-emerald-600 text-sm">
                                        {format(new Date(project.createdAt), "MMM dd, yyyy")}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                                {project.user.image ? (
                                                    <Image 
                                                        src={project.user.image} 
                                                        alt={project.user.name} 
                                                        width={32} 
                                                        height={32} 
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-emerald-600 text-xs font-bold">
                                                        {project.user.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-emerald-700 font-medium">{project.user.name}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200 rounded-full"
                                                >
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            
                                            <DropdownMenuContent 
                                                align="end" 
                                                className="w-52 bg-white border border-emerald-200 shadow-lg rounded-lg p-1"
                                            >
                                                <DropdownMenuItem 
                                                    asChild
                                                    className="flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Link 
                                                        href={`/playground/${project.id}`} 
                                                        className="flex items-center gap-2 w-full"
                                                    >
                                                        <Eye className="h-4 w-4"/>Open Project
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    asChild
                                                    className="flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Link 
                                                        href={`/playground/${project.id}`} 
                                                        target="_blank" 
                                                        className="flex items-center gap-2 w-full"
                                                    >
                                                        <ExternalLink className="h-4 w-4"/>Open in New Tab
                                                    </Link>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSeparator className="bg-emerald-200 my-1" />
                                                <DropdownMenuItem 
                                                    onClick={() => handleEditClick(project)}
                                                    className="flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Edit3 className="h-4 w-4"/>Edit Project
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDuplicateProject(project)}
                                                    className="flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Copy className="h-4 w-4"/>Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => copyProjectUrl(project.id)}
                                                    className="flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Download className="h-4 w-4"/>Copy URL
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-emerald-200 my-1" />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteClick(project)} 
                                                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 px-3 py-2 rounded-md"
                                                >
                                                    <Trash2 className="h-4 w-4"/>Delete Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>

            {/* Edit Project Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border border-emerald-200 rounded-xl shadow-xl">
                    <DialogHeader className="border-b border-emerald-200 pb-4">
                        <DialogTitle className="text-emerald-800">Edit Project</DialogTitle>
                        <DialogDescription className="text-emerald-600">
                            Make changes to your project details here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-emerald-700">Project Title</Label>
                            <Input 
                                id="title" 
                                value={editData.title} 
                                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))} 
                                placeholder="Enter project title" 
                                className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-emerald-700">Description</Label>
                            <Textarea 
                                id="description" 
                                value={editData.description} 
                                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))} 
                                placeholder="Enter project description" 
                                rows={3} 
                                className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditDialogOpen(false)} 
                            disabled={isLoading}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleUpdateProject} 
                            disabled={isLoading || !editData.title.trim()}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white border border-emerald-200 rounded-xl shadow-xl">
                    <AlertDialogHeader className="border-b border-emerald-200 pb-4">
                        <AlertDialogTitle className="text-emerald-800">Delete Project</AlertDialogTitle>
                        <AlertDialogDescription className="text-emerald-600">
                            Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone. All files and data associated with this project will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex gap-3">
                        <AlertDialogCancel 
                            disabled={isLoading}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteProject} 
                            disabled={isLoading} 
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            {isLoading ? "Deleting..." : "Delete Project"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
