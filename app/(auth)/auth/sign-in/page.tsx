//D:\vscodedata\codebuddy\app\(auth)\auth\sign-in\sign_in_page.tsx

//D:\vscodedata\codebuddy\Code_Buddyy_Logo.jpg


import SignInFormClient from '@/features/auth/components/sign-in-form-client'
import Image from 'next/image'
import React from 'react'

const SignInPage = () => {
    return (
        <>
            <Image src={"/Code_Buddyy_Logo.jpg"} alt="Login-Image" height={300} width={300} className='m-6 object-cover' />
            
            <SignInFormClient/>
        </>
    )
}

export default SignInPage















