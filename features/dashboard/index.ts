// features/dashboard/index.ts

"use server"

import { currentUser } from "../auth/action"
import { db } from "@/lib/db"
import { Template } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const createPlayground = async (templateKey: string, title: string, description?: string) => {
    const user = await currentUser();
    
    if (!user || !user.id) {
        throw new Error('User not authenticated');
    }

    // Validate template key against schema
    const validTemplates: Template[] = [
        'REACTJS', 'NEXTJS', 'EXPRESS', 'VUE', 'ANGULAR', 'SHADCN',
        'GRAPHQL', 'HONO', 'NEXT', 'SVELTE', 'JsonGraphqlServer',
        'JavaScript', 'WebPlatform'
    ];

    if (!validTemplates.includes(templateKey as Template)) {
        throw new Error(`Invalid template key: ${templateKey}`);
    }

    try {
        const playground = await db.playground.create({
            data: {
                title,
                template: templateKey as Template,
                userId: user.id as string,
                description: description || '',
            }
        });
        
        return playground;
    } catch (error) {
        console.error('Error creating playground:', error);
        throw error;
    }
};


const getAllPlaygroundForUser = async () => {
    const user = await currentUser();
    try {
        const playgrounds = await db.playground.findMany({
            where: {
                userId: user?.id
            },
            include: {
                user: true
            }
        });
        return playgrounds;
    } catch (error) {
        console.error('Error fetching playgrounds:', error);
        return [];
    }
};


export const deleteProjectById = async (id: string) => {
    try {
        await db.playground.delete({
            where: { id }
        })
        revalidatePath("/dashboard");
    } catch (error) {
        console.error(error)
        throw error;
    }
}


export const editProjectById = async (id: string, data: { title: string, description: string }) => {
    try {
        await db.playground.update({
            where: { id },
            data: data
        })
        revalidatePath("/dashboard");
    } catch (error) {
        console.error(error)
        throw error;
    }
}


export const duplicateProjectById = async (id: string) => {
    try {
        const originalPlayground = await db.playground.findUnique({
            where: { id },
        });
        
        if (!originalPlayground) {
            throw new Error("Playground not found");
        }
        
        const duplicatePlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
            }
        });
        revalidatePath("/dashboard");
        return duplicatePlayground;
    } catch (error) {
        console.error("Error duplicating project:", error);
        throw error;
    }
};

// Export the getAllPlaygroundForUser function as well if needed
export { getAllPlaygroundForUser };
