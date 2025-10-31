// D:\vscodedata\codebuddy\features\dashboard\actions\components\template-selection-model.tsx

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Check, Plus,Clock } from "lucide-react"
import { Description } from '@radix-ui/react-dialog'
//import { Template } from '@prisma/client'


type TemplateSelectionModelProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        template: "REACTJS" | "NEXTJS" | "EXPRESS" | "VUE" | "ANGULAR" | "SHADCN" | "GRAPHQL" | "HONO" | "NEXT" | "SVELTE" | "JsonGraphqlServer" | "JavaScript" | "WebPlatform";
        description?: string
    }) => void;
}

interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    popularity: number;
    tags: string[];
    features: string;
    category: "frontend" | "backend" | "fullstack";
}

const TemplateSelectionModel = ({ isOpen, onClose, onSubmit }: TemplateSelectionModelProps) => {
    const [step, setStep] = React.useState<'select' | 'configure'>('select');
    const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [category, setCategory] = React.useState<"all" | "frontend" | "backend" | "fullstack">("all");
    const [projectName, setProjectName] = React.useState("");

    // Helper function to determine if background is dark
    const isDarkColor = (hexColor: string) => {
        // Remove # if present
        const hex = hexColor.replace('#', '');
        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Calculate brightness (luminance formula)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    };

    // Render stars based on popularity rating
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="flex">
                {Array(fullStars).fill(0).map((_, i) => (
                    <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-current" />
                ))}
                {hasHalfStar && (
                    <Star size={14} className="text-yellow-400" />
                )}
                {Array(emptyStars).fill(0).map((_, i) => (
                    <Star key={`empty-${i}`} size={14} className="text-gray-300" />
                ))}
            </div>
        );
    };

    // Handle template selection
const templates: Template[] = [
    // Frontend Templates
    {
        id: "1",
        name: "REACTJS",
        description: "Modern React application with TypeScript",
        icon: "⚛️",
        color: "#E3F2FD",
        popularity: 4.8,
        tags: ["React", "TypeScript", "Vite"],
        features: "TypeScript, Tailwind CSS, Jest",
        category: "frontend"
    },
    {
        id: "2",
        name: "NEXTJS",
        description: "Complete Next.js application with API routes",
        icon: "🚀",
        color: "#F5F5F5",
        popularity: 4.9,
        tags: ["Next.js", "React", "API"],
        features: "API Routes, SSR, SSG",
        category: "fullstack"
    },
    {
        id: "3",
        name: "VUE",
        description: "Vue.js application with TypeScript and Vite",
        icon: "💚",
        color: "#E8F5E9",
        popularity: 4.7,
        tags: ["Vue.js", "TypeScript", "Vite"],
        features: "TypeScript, Composition API, Vuex",
        category: "frontend"
    },
    {
        id: "4",
        name: "ANGULAR",
        description: "Angular application with TypeScript",
        icon: "🅰️",
        color: "#FFEBEE",
        popularity: 4.6,
        tags: ["Angular", "TypeScript", "RxJS"],
        features: "TypeScript, RxJS, Angular CLI",
        category: "frontend"
    },
    {
        id: "5",
        name: "SHADCN",
        description: "Shadcn UI components with React",
        icon: "🎨",
        color: "#F3E5F5",
        popularity: 4.5,
        tags: ["React", "UI", "Components"],
        features: "UI Components, Tailwind CSS, TypeScript",
        category: "frontend"
    },
    {
        id: "6",
        name: "GRAPHQL",
        description: "GraphQL API with Node.js and Apollo",
        icon: "📡",
        color: "#E0F2F1",
        popularity: 4.4,
        tags: ["GraphQL", "API", "Node.js"],
        features: "GraphQL Schema, Resolvers, Queries",
        category: "backend"
    },
    {
        id: "7",
        name: "HONO",
        description: "Hono web framework with TypeScript",
        icon: "⚡",
        color: "#FFF3E0",
        popularity: 4.3,
        tags: ["Hono", "Web Framework", "TypeScript"],
        features: "Fast HTTP Server, Middleware, Routing",
        category: "backend"
    },
    {
        id: "8",
        name: "NEXT",
        description: "Next.js framework with TypeScript",
        icon: "🚀",
        color: "#F5F5F5",
        popularity: 4.6,
        tags: ["Next.js", "React", "SSG"],
        features: "Server Side Rendering, Static Site Generation",
        category: "fullstack"
    },
    {
        id: "9",
        name: "SVELTE",
        description: "Svelte framework with TypeScript",
        icon: "⚡",
        color: "#FFE0B2",
        popularity: 4.2,
        tags: ["Svelte", "Framework", "TypeScript"],
        features: "Component Based, Reactive, Lightweight",
        category: "frontend"
    },
    {
        id: "10",
        name: "JsonGraphqlServer",
        description: "JSON GraphQL server with Node.js",
        icon: "📊",
        color: "#E8F5E9",
        popularity: 4.1,
        tags: ["GraphQL", "JSON", "Server"],
        features: "JSON Schema, GraphQL Queries, REST API",
        category: "backend"
    },
    {
        id: "11",
        name: "JavaScript",
        description: "JavaScript application with modern features",
        icon: "📜",
        color: "#FFECB3",
        popularity: 4.7,
        tags: ["JavaScript", "ES6", "Modern"],
        features: "ES6 Features, Async/Await, Modules",
        category: "frontend"
    },
    {
        id: "12",
        name: "WebPlatform",
        description: "Web platform with modern web technologies",
        icon: "🌐",
        color: "#E3F2FD",
        popularity: 4.5,
        tags: ["Web", "Platform", "Modern"],
        features: "Web Standards, Progressive Web App, Responsive",
        category: "fullstack"
    }
];



    // Filter templates based on search and category
    const filteredTemplates = templates.filter((template) => {
        const matchesSearch = 
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = category === "all" || template.category === category;
        return matchesSearch && matchesCategory;
    });

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('configure');
    };

    const handleSubmit = () => {
        if (selectedTemplate && projectName.trim()) {
            const template = templates.find(t => t.id === selectedTemplate);
            if (template) {
                onSubmit({
                    title: projectName,
                    template: template.name as any,
                    description: template.description
                });
                // Reset form
                setStep('select');
                setSelectedTemplate(null);
                setProjectName("");
            }
        }
    };

    const handles = ()=> {
    if (selectedTemplate) {
        const templateMap: Record<
            string, // Template 
            "REACTJS" | "NEXTJS" | "EXPRESS" | "VUE" | "ANGULAR" | "SHADCN" | "GRAPHQL" | "HONO" | "NEXT" | "SVELTE" | "JsonGraphqlServer" | "JavaScript" | "WebPlatform"
        > = {
            react: "REACTJS", 
            next: "NEXTJS", 
            express: "EXPRESS",
            hono: "HONO", 
            vue: "VUE", 
            angular: "ANGULAR", 
            shadcn: "SHADCN", 
            graphql: "GRAPHQL", 
            nextjs: "NEXT", 
            svelte: "SVELTE", 
            jsongraphqlserver: "JsonGraphqlServer", 
            javascript: "JavaScript", 
            webplatform: "WebPlatform"
        };
        
        const template = templateMap[selectedTemplate];
        onSubmit({
            title: projectName || `New ${template} Project`,
            template: template || "REACTJS",
            description: "" // You'll need to define descriptions for your templates
        })
    }
    onClose();
    // Reset state for next time
    setStep("select");
    setSelectedTemplate(null);
    setProjectName("")
}


    const getSelectedTemplate = () => {
        return templates.find(template => template.id === selectedTemplate);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                // Reset state when closing
                setStep('select');
                setSelectedTemplate(null);
                setProjectName("");
            }
        }}>
            <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
                {step === "select" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-2xl font-bold text-[#e93f3f] flex items-center gap-2'>
                                <Plus size={24} className='text-[#e93f3f]' />
                                Select Template
                            </DialogTitle>
                            <DialogDescription>
                                Choose a template to create your new Playground.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className='flex flex-col gap-6 py-4'>
                            <div className='flex flex-col gap-4'>
                                <div className='relative flex-1'>
                                    <Search 
                                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                        size={18} />
                                    <Input 
                                        placeholder='Search templates..'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='pl-10' />
                                </div>
                                
                                <Tabs defaultValue='all' className='w-full sm:w-auto' onValueChange={(value) => setCategory(value as any)}>
                                    <TabsList className='grid grid-cols-4 w-full sm:w-[400px]'>
                                        <TabsTrigger value='all'>All</TabsTrigger>
                                        <TabsTrigger value='frontend'>Frontend</TabsTrigger>
                                        <TabsTrigger value='backend'>Backend</TabsTrigger>
                                        <TabsTrigger value='fullstack'>Fullstack</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Radio Group Implementation */}
                            <RadioGroup value={selectedTemplate || ""} onValueChange={handleTemplateSelect}>
                                <div className='flex flex-col gap-3'>
                                    {filteredTemplates.length > 0 ? (
                                        filteredTemplates.map((template) => {
                                            const isDarkBg = isDarkColor(template.color);
                                            const textColor = isDarkBg ? 'text-white' : 'text-gray-800';
                                            const textMutedColor = isDarkBg ? 'text-gray-200' : 'text-gray-600';
                                            
                                            return (
                                                <div 
                                                    key={template.id}
                                                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                                                        selectedTemplate === template.id
                                                            ? "border-[#e93f3f] shadow-[0_0_0_1px_#e93f3f,0_8px_20px_rgba(233,63,63,0.15)]"
                                                            : "hover:border-[#e93f3f] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                                                    }`}
                                                    style={{ backgroundColor: template.color }}
                                                    onClick={() => handleTemplateSelect(template.id)}
                                                >
                                                    {selectedTemplate === template.id && (
                                                        <div className='absolute top-2 left-2 bg-[#e93f3f] text-white rounded-full p-1'>
                                                            <Check size={14} />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div 
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                                                            style={{ 
                                                                backgroundColor: template.color === '#F5F5F5' ? '#E0E0E0' : template.color,
                                                                border: isDarkColor(template.color) ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            <span className={isDarkColor(template.color) ? 'text-white' : 'text-gray-800'}>
                                                                {template.icon}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className={`font-semibold ${textColor} truncate`}>{template.name}</h3>
                                                                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                                    {renderStars(template.popularity)}
                                                                    <span className={`text-xs ml-1 ${textMutedColor}`}>({template.popularity})</span>
                                                                </div>
                                                            </div>
                                                            <p className={`text-sm ${textMutedColor} truncate`}>{template.description}</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {template.tags.map((tag, index) => (
                                                                    <span 
                                                                        key={index} 
                                                                        className={`text-xs px-2 py-1 rounded ${
                                                                            isDarkColor(template.color) 
                                                                                ? 'bg-black bg-opacity-20 text-gray-100' 
                                                                                : 'bg-white bg-opacity-70 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <h3 className='text-lg font-medium'>No Templates found </h3>
                                            <p>Try adjusting your search or filters</p>
                                        </div>
                                    )}
                                </div>

                            </RadioGroup>
                            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 rounded-xl shadow-sm border border-blue-100">
                                    <div className="flex items-center text-gray-700">
                                        <Clock size={18} className="mr-2 text-blue-500" />
                                        <span className="font-medium">
                                            Setup time:{" "}
                                            <span className={`font-semibold ${selectedTemplate ? "text-green-600" : "text-orange-500"}`}>
                                                {selectedTemplate ? "3-6 minutes" : "Select template"}
                                            </span>
                                        </span>
                                    </div>
                                    
                                    {selectedTemplate && (
                                        <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                            <span className="text-xs font-medium text-green-700">Quick setup</span>
                                        </div>
                                    )}
                                    
                                    <div className="text-xs text-gray-500 italic">
                                        ⚡ Optimized
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-2xl font-bold text-[#e93f3f]'>
                                Configure Project
                            </DialogTitle>
                            <DialogDescription>
                                Set up your project details
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className='flex flex-col gap-4 py-4'>
                            <div>
                                <Label htmlFor="projectName">Project Name</Label>
                                <Input 
                                    id="projectName"
                                    placeholder="Enter project name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="projectDescription">Description</Label>
                                <Textarea 
                                    id="projectDescription"
                                    placeholder="Enter project description"
                                    value={getSelectedTemplate()?.description || ""}
                                    readOnly
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                                    style={{ backgroundColor: getSelectedTemplate()?.color || '#e93f3f' }}
                                >
                                    <span>{getSelectedTemplate()?.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{getSelectedTemplate()?.name}</h3>
                                    <p className="text-sm text-gray-600 capitalize">{getSelectedTemplate()?.category}</p>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('select')}>
                                Back
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={!projectName.trim() || !selectedTemplate}
                            >
                                Create Project
                            </Button>
                        </DialogFooter>
                    </>
                    
                )}
            </DialogContent>
        </Dialog>
    )
}

export default TemplateSelectionModel
