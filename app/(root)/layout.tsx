import React from "react"
import Header from "@/features/home/components/header"
import Footer from "@/features/home/components/footer"
import { Metadata } from "next"
import { cn } from "@/lib/utils"

export const metadata : Metadata = {
    title:{
        template:"CodeBuddy - Editor",
        default: "Code Editor for Developers - CodeBuddy",
    },
    description: "AI-powered code editor with intelligent suggestions, real-time collaboration, and advanced debugging tools for developers",
    openGraph: {
        title: "CodeBuddy - AI Code Editor",
        description: "Enhance your coding experience with our intelligent AI-based code editor",
        url: "https://codebuddy.dev",
        siteName: "CodeBuddy",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "CodeBuddy - AI Code Editor"
            }
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "CodeBuddy - AI Code Editor",
        description: "Enhance your coding experience with our intelligent AI-based code editor",
        images: ["/og-image.jpg"],
    },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
            <Header />
            
            {/* Decorative Background Patterns */}
            <div className={cn(
                "absolute inset-0 z-0",
                '[background-size:40px_40px]',
                "[background-image:linear-gradient(to_right, #e4e4e7_1px), linear-gradient(to_bottom,#e4e4e7_1px, transparent_1px)]", 
                "dark:[background-image:linear-gradient(to_right, #262626_1px), linear-gradient(to_bottom, #262626_1px, transparent_1px)]"
            )} />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-white/50 to-transparent dark:from-zinc-900/50 to-transparent" />
            
            {/* Radial Gradient Mask */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-white/10 dark:bg-black/20" 
                style={{
                    maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black)'
                }} 
            />
            
            {/* Main Content */}
            <main className="relative z-20 w-full flex-grow pt-0 md:pt-0">
                {children}
            </main>
            
            <Footer />
        </div>
    )
}
