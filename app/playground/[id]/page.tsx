// D:\vscodedata\codebuddy\app\playground\[id]\page.tsx
"use client";

import React, { useRef } from "react";
import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {TemplateFileTree}  from "@/features/playground/components/template-file-tree";
import { TemplateFile } from "@/features/playground/lib/path-to-json";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, FolderOpen,AlertCircle, Save, X,Settings,} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup,} from "@/components/ui/resizable";
//import WebContainerPreview from "@/features/webcontainers/components/webcontainer-preveiw";
//import LoadingStep from "@/components/ui/loader";
//import { PlaygroundEditor } from "@/features/playground/components/playground-editor";
//import ToggleAI from "@/features/playground/components/toggle-ai";
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer";
import { UsePlayground } from "@/features/playground/hooks/usePlayground";
//import { useAISuggestions } from "@/features/playground/hooks/useAISuggestion";
//import { useWebContainer } from "@/features/webcontainers/hooks/useWebContainer";
import { SaveUpdatedCode } from "@/features/playground/actions";
import { TemplateFolder } from "@/features/playground/types";
import { findFilePath } from "@/features/playground/lib";
import  ConfirmationDialog  from "@/features/playground/components/dialogs/conformation-dialog";


const Page = () => {
    const { id } = useParams<{ id: string }>();
    
    const { playgroundData, templateData, isLoading, error, saveTemplateData } = UsePlayground(id);

        const {
        activeFileId,
        closeAllFiles,
        openFile,
        closeFile,
        editorContent,
        updateFileContent,
        handleAddFile,
        handleAddFolder,
        handleDeleteFile,
        handleDeleteFolder,
        handleRenameFile,
        handleRenameFolder,
        openFiles,
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        setOpenFiles,
    } = useFileExplorer();

    const wrappedHandleRenameFile = useCallback(
        (
        file: TemplateFile,
        newFilename: string,
        newExtension: string,
        parentpath: string
        ) => {
        handleRenameFile(file, newFilename, newExtension, parentpath, saveTemplateData);
        },
        [handleRenameFile, saveTemplateData]
    );

    const wrappedHandleRenameFolder = useCallback(
        (
        folder: TemplateFolder,
        newFolderName: string,
        parentPath: string
        ) => {
        return handleRenameFolder(folder, newFolderName, parentPath, saveTemplateData);
        },
        [handleRenameFolder, saveTemplateData]
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
        <div className="flex h-screen flex-col">
        <TooltipProvider>
            <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" />

                <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-col flex-1">
                    {playgroundData?.title || "Code Playground"}
                </div>
                </div>
            </header>
            </SidebarInset>
        </TooltipProvider>

        <div className="flex flex-1 overflow-hidden">
            <TemplateFileTree data={templateData!} />
            {/* Add editor or other content here */}
        </div>
        </div>
    );
};

export default Page;
