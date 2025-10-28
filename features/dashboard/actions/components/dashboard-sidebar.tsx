"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import Link from "next/link";
import Image from "next/image";
import { Code2, Compass, Database, FlameIcon, Folder, Home, LayoutDashboard, Lightbulb, LucideIcon, Plus, Settings, Settings2, Star, Terminal, Zap, History } from 'lucide-react';

interface PlaygroundDataProps{
    id:string;
    name:string;
    icon: string;
    starred:boolean;
    lastOpened?: Date;
}

const lucideIconMap: Record<string, LucideIcon> = {
    Zap:Zap,
    Lightbulb:Lightbulb,
    Database:Database,
    Compass:Compass,
    FlameIcon:FlameIcon,
    Terminal:Terminal,
    Code2:Code2,
}

const DashboardSidebar = ({initialPlaygroundData}:{initialPlaygroundData:PlaygroundDataProps[]}) => {
    const pathname = usePathname();
    const [starredPlaygrounds, setStarredPlaygrounds] = useState<PlaygroundDataProps[]>([]);
    const [recentPlaygrounds, setRecentPlaygrounds] = useState<PlaygroundDataProps[]>([]);
    const [playgroundData, setPlaygroundData] = useState<PlaygroundDataProps[]>(initialPlaygroundData);

    // Initialize recent and starred playgrounds
    useEffect(() => {
        // Sort by last opened (most recent first) and take top 10
        const sortedRecent = [...initialPlaygroundData]
            .filter(p => p.lastOpened) // Only include those with lastOpened date
            .sort((a, b) => {
                if (!a.lastOpened || !b.lastOpened) return 0;
                return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
            })
            .slice(0, 10);
        
        setRecentPlaygrounds(sortedRecent);
        
        // Get starred playgrounds
        const starred = initialPlaygroundData.filter(p => p.starred);
        setStarredPlaygrounds(starred);
    }, [initialPlaygroundData]);

    const toggleStar = (playgroundId: string) => {
        setPlaygroundData(prev => {
            const updated = prev.map(p => 
                p.id === playgroundId ? { ...p, starred: !p.starred } : p
            );
            
            // Update starred list
            const newStarred = updated.filter(p => p.starred);
            setStarredPlaygrounds(newStarred);
            
            return updated;
        });
    };

    return (
    <Sidebar variant = 'inset' collapsible = 'icon' className='border-1 border-2' >
        <SidebarHeader>
            <div className="flex item-center gap-2 px-4 py-3 justify-center">
                <Image src="/banner/logo.svg" alt="logo" width={30} height={30}/>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive = {pathname ==='/'} tooltip={'Home'}>
                        <Link href={"/"}> <Home className = 'size-4'/>  <span> Home</span> </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>    
                    <SidebarMenuButton asChild isActive = {pathname ==='/dashboard'} tooltip={'Dashboard'}>
                        <Link href={"/dashboard"}> <LayoutDashboard className = 'size-4'/>  <span> Dashboard</span> </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel><Star className = 'size-4 mr-2'/>Starred</SidebarGroupLabel>
                <SidebarGroupAction title="Add starred Playground"> <Plus className="size-4"/> </SidebarGroupAction>
                <SidebarGroupContent>
                    {starredPlaygrounds.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4 w-full">No starred playgrounds</div>
                    ) : (
                        <SidebarMenu>
                            {starredPlaygrounds.map((playground) => {
                                const IconComponent = lucideIconMap[playground.icon] || Code2;
                                return (
                                    <SidebarMenuItem key={playground.id}>
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={pathname === `/playground/${playground.id}`}
                                            tooltip={playground.name}
                                        >
                                            <Link href={`/playground/${playground.id}`}>
                                                {IconComponent && <IconComponent className="size-4"/>}
                                                <span>{playground.name}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleStar(playground.id);
                                                    }}
                                                    className="ml-auto hover:text-yellow-400 transition-colors"
                                                >
                                                    <Star 
                                                        className={`size-4 ${playground.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                                                    />
                                                </button>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    )}
                </SidebarGroupContent>  
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel><History className = "h-4 w-4 mr-2" />Recent</SidebarGroupLabel>
                <SidebarGroupAction title="Create New Playground"> <Folder className="size-4"/> </SidebarGroupAction>
                <SidebarGroupContent>
                    {recentPlaygrounds.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4 w-full">No recent playgrounds</div>
                    ) : (
                        <SidebarMenu>
                            {recentPlaygrounds.map((playground) => {
                                const IconComponent = lucideIconMap[playground.icon] || Code2;
                                return (
                                    <SidebarMenuItem key={playground.id}>
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={pathname === `/playground/${playground.id}`}
                                            tooltip={playground.name}
                                        >
                                            <Link href={`/playground/${playground.id}`}>
                                                {IconComponent && <IconComponent className="size-4"/>}
                                                <span>{playground.name}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleStar(playground.id);
                                                    }}
                                                    className="ml-auto hover:text-yellow-400 transition-colors"
                                                >
                                                    <Star 
                                                        className={`size-4 ${playground.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                                                    />
                                                </button>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    )}
                </SidebarGroupContent>  
            </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings"> 
                        <Link href="/setting"><Settings className="h-4 w-4"/><span>Settings</span> </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        <SidebarRail/>
    </Sidebar>
    )
}

export default DashboardSidebar
