import React from "react";
import DashboardSidebar  from '@/features/dashboard/actions/components/dashboard-sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({children}:{children:React.ReactNode}) {
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