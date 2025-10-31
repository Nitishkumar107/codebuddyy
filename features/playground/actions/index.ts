// D:\vscodedata\codebuddy\features\playground\actions\index.ts



"use server"

import { currentUser } from "@/features/auth/action"
import {db} from "@/lib/db"
import { TemplateFolder } from "../lib/path-to-json"
import { revalidatePath } from "next/cache"

export const getPlaygroundById = async (id:string) => {
    try {
        const playground = await db.playground.findUnique({
            where:{id},
            select:{
                id: true,
                title:true,
                description:true,
                templateFiles:{
                    select:{content:true}
                }
            }
        })
        return playground; // This will return the playground object or null
    }
    catch (error) {
        console.error("Error fetching playground:", error);
        return null;
    }
}

export const SaveUpdatedCode = async(playgroundId:string,data:TemplateFolder)=>{
    const user = await currentUser();
    if (!user) return null;
    try{
        const updatedPlayground = await db.templateFile.upsert({
            where:{playgroundId},
            update:{content:JSON.stringify(data)},
            create:{playgroundId, content:JSON.stringify(data)}
        })
        return updatedPlayground;
    }
    catch(error){
        console.error("Error saving playground:", error);
        return null;
    }
}
















