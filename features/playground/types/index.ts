// D:\vscodedata\codebuddy\features\playground\types\index.ts

import { findFilePath } from "../lib";





export interface TemplateFile{
    filename: string;
    fileExtension : string;
    content: string;
}

export interface playgroundData{
    id: string;
    name?: string;
    [key: string]: any;
}

export interface TemplateFolder{
    folderName:string;
    items: (TemplateFile | TemplateFolder)[];
}

export interface LoadingStepProps{
    currentStep: number;
    step: number;
    label:string;
}

export const generateFileId = (file: TemplateFile, rootFolder: TemplateFolder): string => {
  // Find the file's path in the folder structure
    const path = findFilePath(file, rootFolder)?.replace(/^\/+/, '') || '';
    
    // Handle empty/undefined file extension
    const extension = file.fileExtension?.trim();
    const extensionSuffix = extension ? `.${extension}` : '';

    // Combine path and filename
    return path
        ? `${path}/${file.filename}${extensionSuffix}`
        : `${file.filename}${extensionSuffix}`;
}



































