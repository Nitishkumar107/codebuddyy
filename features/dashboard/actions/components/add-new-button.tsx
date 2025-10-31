// D:\vscodedata\codebuddy/features/dashboard/actions/components/add-new-button.tsx

"use client";

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import TemplateSelectionModel from './template-selection-model';
import { createPlayground } from '@/features/dashboard/index'; // Fix this import path
import { useRouter } from 'next/navigation'; // Fix this import
import { toast } from 'react-toastify';
import { Template } from '@prisma/client';

const AddNewButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<{
        title: string;
        template: Template;
        description?: string
    } | null>(null);
    
    const router = useRouter();

    const handleSubmit = async (data: {
        title: string;
        template: Template; // This will now only accept valid template names
        description?: string;
    }) => {
        setSelectedTemplate(data);
        const res = await createPlayground(data.template, data.title);
        toast.success('Playground created successfully');
        setIsModalOpen(false);
        if (res?.id) {
            router.push(`/playground/${res.id}`);
        }
    };

    return (
        <>
            {/* Single "Create New Project" button with proper functionality */}
            <div 
                onClick={() => setIsModalOpen(true)}
                className="group relative px-6 py-5 flex flex-row justify-between items-center border rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 hover:border-[#F59E0B] hover:scale-[1.01] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(245,158,11,0.2)]"
            >
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#F59E0B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                <div className="flex flex-row justify-center items-start gap-4 relative z-10">
                    <div className="flex flex-col justify-center items-center">
                        <Button
                            variant="outline"
                            className="flex justify-center items-center bg-white/90 backdrop-blur-sm group-hover:bg-[#fffbeb] group-hover:border-[#F59E0B] group-hover:text-[#F59E0B] transition-all duration-300 size={'icon'} shadow-sm hover:shadow-md hover:scale-110 border-amber-200"
                            size="icon"
                        >
                            <Plus 
                                size={30} 
                                className="transition-transform duration-300 group-hover:rotate-45 text-[#F59E0B] group-hover:text-[#F59E0B]"
                            />
                        </Button>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#F59E0B] transition-colors duration-300">
                            Create New Project
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                            Start a new playground
                        </p>
                    </div>
                </div>
                
                {/* Animated bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                
                {/* Pulsing animation effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-[#F59E0B] opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse pointer-events-none"></div>
                
                <div className='relative overflow-hidden'>
                    <Image 
                        src="/logo/Logo.jpg" 
                        alt='Create new playground' 
                        width={100} 
                        height={100} 
                        className='transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100'
                    />
                </div>
            </div>
            
            {/* Template Selection Modal */}
            <TemplateSelectionModel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default AddNewButton;
