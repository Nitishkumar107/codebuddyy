export interface User {
    id:string
    name:string
    email:string
    image:string
    role:string
    createdAt:Date
    updateAt:Date
}

export interface Project {
    id:string
    title:string
    description:string
    template:string
    createdAt:Date
    UpdatedAt:Date
    userId:string
    user:User
    Starmark: { isMarked:boolean}[]
}


