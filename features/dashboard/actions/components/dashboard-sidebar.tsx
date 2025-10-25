

// D:\vscodedata\codebuddy\features\dashboard\actions\components\dashboard-sidebar.tsx

"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import { Code2, Compass, Database, FlameIcon, Folder, Home,LayoutDashboard,Lightbulb,LucideIcon,Plus,Settings,Settings2,Star, Terminal, Zap } from 'lucide-react';
import { History } from 'lucide-react';

interface PlaygroundDataProps{
    id:string;
    name:string;
    icon: string;
    starred:boolean;
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
    const [starredPlaygrounds, setStarredPlayground] = useState(initialPlaygroundData.filter((p)=> p.starred));
    const [recentPlaygrounds , setRecentPlaygrounds] = useState(initialPlaygroundData);
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
                            <SidebarMenuButton asChild isActive = {pathname ==='/dashboard'} tooltip={'Home'}>
                                <Link href={"#"}> <LayoutDashboard className = 'size-4'/>  <span> Dashboard</span> </Link>
                            </SidebarMenuButton>
                </SidebarMenuItem>

            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel><Star className = 'size-4 mr-2'/>starred </SidebarGroupLabel>
                <SidebarGroupAction title="Add starred Playground"> <Plus className="size-4"/> </SidebarGroupAction>
                <SidebarGroupContent>
                    <SidebarMenuButton>
                        {
                            starredPlaygrounds.length === 0 && recentPlaygrounds.length === 0 ?
                            (
                                <div className="text-center text-muted-foreground py-4 w-full"> Create Your Playground </div>
                            ):(
                                starredPlaygrounds.map((Playground)=>{
                                    const IconComponent =lucideIconMap[Playground.icon] || Code2;
                                    return(
                                        <SidebarMenuItem key = {Playground.id}>
                                            <SidebarMenuButton asChild isActive={pathname === '/playground/${playground.id}'} tooltip={Playground.name}>
                                                <Link href={'/playground/${playground.id}'}></Link>
                                                    {IconComponent && <IconComponent className="size-4"/>}
                                                    <span>{Playground.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            )       
                        }
                    </SidebarMenuButton>    
                </SidebarGroupContent>  
                

            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel><History className = "h-4 w-4 mr-2" />Recent </SidebarGroupLabel>
                <SidebarGroupAction title="Create New Playground"> <Folder className="size-4"/> </SidebarGroupAction>
                <SidebarGroupContent>
                    <SidebarMenuButton>
                        {
                            starredPlaygrounds.length === 0 && recentPlaygrounds.length === 0 ?
                            (
                                <div className="text-center text-muted-foreground py-4 w-full"> View all Playgrounds </div>
                            ):(
                                starredPlaygrounds.map((Playground)=>{
                                    const IconComponent =lucideIconMap[Playground.icon] || Code2;
                                    return(
                                        <SidebarMenuItem key = {Playground.id}>
                                            <SidebarMenuButton asChild isActive={pathname === '/playground/${playground.id}'} tooltip={Playground.name}>
                                                <Link href={'/playground/${playground.id}'}></Link>
                                                    {IconComponent && <IconComponent className="size-4"/>}
                                                    <span>{Playground.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            )       
                        }
                    </SidebarMenuButton>    
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
