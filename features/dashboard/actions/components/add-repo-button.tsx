

"use client";
import { Button } from '@/components/ui/button';
import { ArrowDown, Plus } from 'lucide-react';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import React from 'react'

const AddRepoButton = () => {
    return (
        <div className="group relative px-6 py-5 flex flex-row justify-between items-center border rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 hover:border-[#22C55E] hover:scale-[1.01] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(34,197,94,0.2)]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#22C55E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        <div className="flex flex-row justify-center items-start gap-4 relative z-10">
            <div className="flex flex-col justify-center items-center">
            <Button
                variant="outline"
                className="flex justify-center items-center bg-white/90 backdrop-blur-sm group-hover:bg-[#f0fdf4] group-hover:border-[#22C55E] group-hover:text-[#22C55E] transition-all duration-300 size={'icon'} shadow-sm hover:shadow-md hover:scale-110 border-gray-200"
                size="icon"
            >
                <ArrowDown 
                size={30} 
                className="transition-transform duration-300 group-hover:rotate-90 text-[#22C55E] group-hover:text-[#22C55E]"
                />
            </Button>
            </div>
            
            <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#22C55E] transition-colors duration-300">
                Open Github Repository
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                Work with your Github Repository
            </p>
            </div>
        </div>
        
        {/* Subtle hover animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
        
        <div className='relative overflow-hidden'>
            <Image 
            src="/images/githubRepo.svg" 
            alt='Open a new playground' 
            width={100} 
            height={100} 
            className='transition-transform duration-300 group-hover:scale-110 opacity-90 group-hover:opacity-100'
            />
        </div>
        </div>
    );
};

export default AddRepoButton;