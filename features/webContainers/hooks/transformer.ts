interface TemplateItem {
    filename: string;
    fileExtension: string;
    content: string;
}

interface TemplateFolder {
    folderName: string;
    items: (TemplateFolder | TemplateItem)[];
}

interface WebContainerFile {
    file: {
        contents: string;
    };
}

interface WebContainerDirectory {
    directory: {
        [key: string]: WebContainerFile | WebContainerDirectory;
    };
}

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

export function transformToWebContainerFormat(template: TemplateFolder): WebContainerFileSystem {
    function processItem(item: TemplateFolder | TemplateItem): WebContainerFile | WebContainerDirectory {
        if ('items' in item) {
            // This is a folder
            const directoryContents: WebContainerFileSystem = {};
            
            item.items.forEach(subItem => {
                const key = 'fileExtension' in subItem 
                    ? `${subItem.filename}.${subItem.fileExtension}`
                    : subItem.folderName!;
                directoryContents[key] = processItem(subItem);
            });

            return {
                directory: directoryContents
            };
        } else {
            // This is a file
            return {
                file: {
                    contents: item.content
                }
            };
        }
    }

    const result: WebContainerFileSystem = {};
    
    template.items.forEach(item => {
        const key = 'fileExtension' in item 
            ? `${item.filename}.${item.fileExtension}`
            : item.folderName!;
        result[key] = processItem(item);
    });

    return result;
}
