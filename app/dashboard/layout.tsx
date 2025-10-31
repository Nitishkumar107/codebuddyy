import React from "react";
import DashboardSidebar  from '@/features/dashboard/actions/components/dashboard-sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/features/dashboard";
import { Zap, Lightbulb, Server, Code, Flame, Database, FileCode, Box, Braces, Terminal} from 'lucide-react';
import { Playground } from "@prisma/client";

export default async function DashboardLayout({children}:{children:React.ReactNode}) {
    const playgroundData = await getAllPlaygroundForUser();
    const technologyIconMap: Record<string, React.ComponentType> = {
        REACTJS: Zap,        // Lightning bolt
        NEXTJS: Lightbulb,   // Innovation
        EXPRESS: Server,     // Backend server
        VUE: Braces,         // Curly braces for Vue
        HONO: Flame,         // Speed and fire
        ANGULAR: Box,        // Framework container
        SHADCN: FileCode,    // Code file
        GRAPHQL: Database,   // Database operations
        SVELTE: Braces,      // Curly braces for Svelte
        JsonGraphqlServer: Terminal, // Terminal for JSON/GraphQL
        JavaScript: Code,    // Code icon
        WebPlatform: Server, // Server for web platform
        // Note: NEXT is not in your templatePaths, so it's removed
    };
    
    const formatedPlaygroundData = playgroundData?.map((playground) => ({
        id: playground.id,
        name: playground.title,
        starred: technologyIconMap[playground.template] || Code // fallback to Code icon
    })) || [];

    return(
        <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-x-hidden" >
                {/*todo: dashboardSidebar implement */}
                <DashboardSidebar  initialPlaygroundData={[]} />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
