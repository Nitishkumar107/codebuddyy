// D:\vscodedata\codebuddy\features\auth\hooks\use-current-user.ts

import { useSession } from "next-auth/react"

export const useCurrentUser = ()=>{
    const session = useSession();

    return session?.data?.user
}


