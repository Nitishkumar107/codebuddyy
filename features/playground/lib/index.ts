import { FileEditIcon } from "lucide-react";
import { TemplateFile, TemplateFolder } from "../types";


export const generateFileId = (file: TemplateFile, rootFolder: TemplateFolder | null | undefined): string => {
    // Handle null/undefined rootFolder
    if (!rootFolder) {
        const extension = file.fileExtension?.trim();
        const extensionSuffix = extension ? `.${extension}` : '';
        return `${file.filename}${extensionSuffix}`;
    }
    
    // find the file's path in the folder structure
    const path = findFilePath(file, rootFolder)?.replace(/^\/+/, '') || '';

    // Handle empty/undefined file extension
    const extension = file.fileExtension?.trim();
    const extensionSuffix = extension ? `.${extension}` : '';

    // Combine path and filename
    return path
    ? `${path}/${file.filename}${extensionSuffix}`
    : `${file.filename}${extensionSuffix}`;
}
export default generateFileId;

export function findFilePath(
    file: TemplateFile,
    folder: TemplateFolder,
    pathSoFar: string[] = []
        ): string | null {
            for (const item of folder.items) {
                if ("folderName" in item) {
                    const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
                    if (res) return res;
                }
                else {
                        if (
                            item.filename === file.filename &&
                            item.fileExtension === file.fileExtension
                        )
                        {
                            return [
                                ...pathSoFar,
                                item.filename + (item.fileExtension ? "." + item.fileExtension: ""),
                            ].join('/');
                        }
                }
            }
            return null;
        }



