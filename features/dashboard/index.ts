// D:\vscodedata\codebuddy\features\dashboard\index.ts

"use server"

import { title } from "process"
import { currentUser } from "../auth/action"
import { db } from "@/lib/db"
import { Template } from "@prisma/client"
import { deserialize } from "v8"
import { Description } from "@radix-ui/react-dialog"

import { revalidatePath } from "next/cache"

export const createPlayground = async(data:{
    title: string;
    template:Template;
    description?: string;
}) => {
    const {template, title, description} = data;
    const user = await currentUser();

    try {
        return await db.playground.create({
            data : {
                title,
                description: description || "",
                template,
                userId: user?.id!
            }
        });
    }
    catch (error) {
        console.error(error);
        return null;
    }
}


export const getAllPlaygroundForUser = async() =>{
    const user = await currentUser();

    try{
        const playground = await db.playground.findMany({
            where:{
                userId:user?.id
            },
            include:
            {
                user:true,
                starMarks:{
                    where:{
                        userId:user?.id
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        })
        return playground
    }catch (error){
        console.error(error)
            return null
    }
}

export const deleteProjectById = async (id:string)=>{
    try{
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard");
        }
    catch(error){
        console.error(error)
    }
}


export const editProjectById = async(id:string,data:{title:string, description:string})=>{
    try{
        await db.playground.update({
            where:{id},
            data:data
                })
        }
    catch (error){
                console.error(error)
                }
}


export const duplicateProjectById = async(id: string) => {
    try {
        const originalPlayground = await db.playground.findUnique({
            where: { id },
        });
        
        if (!originalPlayground) {
            throw new Error("playground not found");
        }
        
        const duplicatePlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
                // Add other fields that need to be duplicated
            }
        });
        revalidatePath("/dashboard");
        return duplicatePlayground;
    } catch (error) {
        console.error("Error duplicating project:", error);
        throw error; // Re-throw the error so caller can handle it
    }
};





