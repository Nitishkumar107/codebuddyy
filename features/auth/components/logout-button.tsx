
// D:\vscodedata\codebuddy\features\auth\components\logout-button.tsx





import React from 'react'
import { LogoutButtonProps } from '../types'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';

const LogoutButton = ({children}:LogoutButtonProps) => {
    const router = useRouter();
    const onLogout = async () => {
        try {
            await signOut();
            router.refresh();
        } catch (error) {
            alert('Logout failed. Please try again.');
            // Optionally, you could implement a retry mechanism here.
            // Or use a toast/notification system if available in your project.
        }
    }
    return (
        <span className='cursor-pointer' onClick={onLogout}>
            {children}
        </span>
    )
}

export default LogoutButton





