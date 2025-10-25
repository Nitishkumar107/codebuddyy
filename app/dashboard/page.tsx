// app/dashboard/page.tsx
import AddNewButton from '@/features/dashboard/actions/components/add-new-button'
import AddRepoButton from '@/features/dashboard/actions/components/add-repo-button'
import EmptyState from '@/components/ui/empty-state'
import React from 'react'

const page = () => {
    const playgrounds:any[] = []
    return (
        <div className='flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10 '>
            <div className='grid grid-cols-2 md:grid-cols-2 gap-6 w-full'>
                <AddNewButton/>
                <AddRepoButton/>
            </div>
            <div className='mt-10 flex flex-col justify-center items-center w-full'>
                {
                    playgrounds && playgrounds.length === 0 ? (<EmptyState title='No project Found'
                    description='Create a new Project to get Started' imageSrc='/banner/Logo.svg'
                    />) : (
                        // todo and playground table
                        <p>
                            playground table 
                        </p>
                    )
                }
            </div>
        </div>
    )
}

export default page
































