

import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
    title: string;
    description: string;
    imageSrc?: string;
}

const EmptyState = ({ title, description, imageSrc }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {imageSrc && (
                <Image src={imageSrc} alt={title || "Empty state"} className="w-48 h-48 mb-4 object-contain" width={60} height={60} />
            )}
            {title && <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>}
            {description && <p className="text-gray-500 max-w-md">{description}</p>}
        </div>
    );
}

export default EmptyState;
