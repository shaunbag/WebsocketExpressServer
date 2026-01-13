export type User = {
    name: string;
    id: string;
}

export type Message = {
    type:string;
    from: User;
    content: string
}